import request from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.specs.js";
import Adoption from "../models/adoption.js";
import Pet from "../models/pet.js";
import Spa from "../models/spa.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import * as config from "../config.js";
import mongoose from "mongoose";

let superUserToken;
let superUser;
let regularUserToken;
let regularUser;
let spa;
let pet;
let adoption;

beforeEach(async () => {
	await cleanUpDatabase();

	// Create a superuser
	const password = "adminpassword";
	const hashedPassword = await bcrypt.hash(password, config.bcryptCostFactor);
	const newSuperUser = await User.create({
		firstName: "Admin",
		lastName: "User",
		email: "admin@example.com",
		password: hashedPassword,
	});
	await newSuperUser.save();
	superUser = newSuperUser;

	const regularPassword = "userpassword";
	const hashedRegularPassword = await bcrypt.hash(regularPassword, config.bcryptCostFactor);
	const newRegularUser = await User.create({
		firstName: "Regular",
		lastName: "User",
		email: "regular@example.com",
		password: hashedRegularPassword,
	});
	await newRegularUser.save();
	regularUser = newRegularUser;

	spa = new Spa({ nom: "SPA1", adresse: "Address1", latitude: "45.0", longitude: "90.0", user_id: superUser._id });
	await spa.save();

	pet = new Pet({ nom: "Pet1", description: "desc", age: 2, spa_id: spa._id });
	await pet.save();

	adoption = new Adoption({ pet_id: pet._id, user_id: superUser._id, date: new Date() });
	await adoption.save();

	// Log in as the superuser to get a token
	const loginBody = { email: newSuperUser.email, password };
	const loginRes = await request(app).post("/users/login").send(loginBody);
	superUserToken = loginRes.body.token;

	const regularLoginBody = { email: newRegularUser.email, password: regularPassword };
	const regularLoginRes = await request(app).post("/users/login").send(regularLoginBody);
	regularUserToken = regularLoginRes.body.token;
});

afterAll(async () => {
	await cleanUpDatabase();
	// close the database connection
	await mongoose.connection.close();
});

describe("Adoptions API, get adoptions", () => {
	it("should list all adoptions", async () => {
		const res = await request(app).get("/adoptions").set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty("pet_id._id", pet._id.toString());
		expect(res.body[0]).toHaveProperty("user_id._id", superUser._id.toString());
		expect(res.body[0]).toHaveProperty("date");
	});
});

describe("Adoptions API, create adoption", () => {
	it("should create a new adoption", async () => {
		const newAdoption = { pet_id: pet._id };
		const res = await request(app).post("/adoptions").set("Authorization", `Bearer ${regularUserToken}`).send(newAdoption);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("_id");
		expect(res.body).toHaveProperty("pet_id", newAdoption.pet_id.toString());
		expect(res.body).toHaveProperty("user_id", regularUser._id.toString());
		expect(res.body).toHaveProperty("date");

		const adoptionInDb = await Adoption.findById(res.body._id);
		expect(adoptionInDb).not.toBeNull();
		expect(adoptionInDb.pet_id.toString()).toEqual(newAdoption.pet_id.toString());
		expect(adoptionInDb.user_id.toString()).toEqual(regularUser._id.toString());
	});
});

describe("Adoptions API, get by ID", () => {
	it("should get an adoption by ID", async () => {
		const res = await request(app).get(`/adoptions/${adoption._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("_id", adoption._id.toString());
		expect(res.body).toHaveProperty("pet_id._id", pet._id.toString());
		expect(res.body).toHaveProperty("user_id._id", adoption.user_id.toString());
		expect(res.body).toHaveProperty("date");
	});

	it("should return 404 for non-existing adoption ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/adoptions/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Adoptions API, delete adoption", () => {
	it("should delete an adoption by ID", async () => {
		const res = await request(app).delete(`/adoptions/${adoption._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(204);

		const adoptionInDb = await Adoption.findById(adoption._id);
		expect(adoptionInDb).toBeNull();
	});

	it("should return 404 for non-existing adoption ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/adoptions/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});
