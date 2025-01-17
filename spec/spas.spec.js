import request from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.specs.js";
import Spa from "../models/spa.js";
import User from "../models/user.js";
import Pet from "../models/pet.js";
import bcrypt from "bcrypt";
import * as config from "../config.js";
import mongoose from "mongoose";

let superUserToken;
let loginBody;
let superUser;
let spa;

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

	spa = new Spa({ nom: "SPA1", adresse: "Address1", latitude: "45.0", longitude: "90.0", user_id: superUser._id });
	await spa.save();

	// Log in as the superuser to get a token
	loginBody = { email: newSuperUser.email, password };
	const loginRes = await request(app).post("/users/login").send(loginBody);
	superUserToken = loginRes.body.token;
});

afterAll(async () => {
	await cleanUpDatabase();
	// close the database connection
	await mongoose.connection.close();
});

describe("Spas API, get spas", () => {
	it("should list all spas", async () => {
		const res = await request(app).get("/spas").set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty("nom", spa.nom);
		expect(res.body[0]).toHaveProperty("adresse", spa.adresse);
		expect(res.body[0]).toHaveProperty("latitude", spa.latitude);
		expect(res.body[0]).toHaveProperty("longitude", spa.longitude);
	});
});

describe("Spas API, create spa", () => {
	it("should create a new spa", async () => {
		const newSpa = { nom: "SPA2", adresse: "Address2", latitude: "46.0", longitude: "91.0" };
		const res = await request(app).post("/spas").set("Authorization", `Bearer ${superUserToken}`).send(newSpa);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("_id");
		expect(res.body).toHaveProperty("nom", newSpa.nom);
		expect(res.body).toHaveProperty("adresse", newSpa.adresse);
		expect(res.body).toHaveProperty("latitude", newSpa.latitude);
		expect(res.body).toHaveProperty("longitude", newSpa.longitude);

		const spaInDb = await Spa.findById(res.body._id);
		expect(spaInDb).not.toBeNull();
		expect(spaInDb.nom).toEqual(newSpa.nom);
		expect(spaInDb.adresse).toEqual(newSpa.adresse);
		expect(spaInDb.latitude).toEqual(newSpa.latitude);
		expect(spaInDb.longitude).toEqual(newSpa.longitude);
	});

	it("should not create a spa with missing fields", async () => {
		const newSpa = { nom: "SPA3" };
		const res = await request(app).post("/spas").set("Authorization", `Bearer ${superUserToken}`).send(newSpa);
		expect(res.statusCode).toEqual(400);
	});
});

describe("Spas API, get by ID", () => {
	it("should get a spa by ID", async () => {
		const res = await request(app).get(`/spas/${spa._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("_id", spa._id.toString());
		expect(res.body).toHaveProperty("nom", spa.nom);
		expect(res.body).toHaveProperty("adresse", spa.adresse);
		expect(res.body).toHaveProperty("latitude", spa.latitude);
		expect(res.body).toHaveProperty("longitude", spa.longitude);
	});

	it("should return 404 for non-existing spa ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/spas/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Spas API, update spa", () => {
	it("should update a spa by ID", async () => {
		const updatedSpa = { nom: "SPA2", adresse: "Address2", latitude: "46.0", longitude: "91.0" };
		const res = await request(app)
			.put(`/spas/${spa._id}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updatedSpa);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("nom", "SPA2");
		expect(res.body).toHaveProperty("adresse", "Address2");
		expect(res.body).toHaveProperty("latitude", "46.0");
		expect(res.body).toHaveProperty("longitude", "91.0");

		const spaInDb = await Spa.findById(spa._id);
		expect(spaInDb.nom).toEqual(updatedSpa.nom);
		expect(spaInDb.adresse).toEqual(updatedSpa.adresse);
		expect(spaInDb.latitude).toEqual(updatedSpa.latitude);
		expect(spaInDb.longitude).toEqual(updatedSpa.longitude);
	});

	it("should return 404 for non-existing spa ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const updatedSpa = { nom: "SPA2", adresse: "Address2", latitude: "46.0", longitude: "91.0" };
		const res = await request(app)
			.put(`/spas/${nonExistingId}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updatedSpa);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Spas API, delete spa", () => {
	it("should delete a spa by ID", async () => {
		const res = await request(app).delete(`/spas/${spa._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(204);

		const spaInDb = await Spa.findById(spa._id);
		expect(spaInDb).toBeNull();
	});

	it("should return 404 for non-existing spa ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/spas/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Spas API, get pets by spa ID", () => {
	it("should list all pets for a spa", async () => {
		const pet = new Pet({ nom: "Pet1", description: "desc", age: 2, spa_id: spa._id });
		await pet.save();

		const res = await request(app).get(`/spas/${spa._id}/pets`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty("nom", pet.nom);
		expect(res.body[0]).toHaveProperty("description", pet.description);
		expect(res.body[0]).toHaveProperty("age", pet.age);
	});

	it("should return 404 for non-existing spa ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/spas/${nonExistingId}/pets`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});
