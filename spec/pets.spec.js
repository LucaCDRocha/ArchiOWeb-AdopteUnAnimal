import request from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.specs.js";
import Pet from "../models/pet.js";
import Spa from "../models/spa.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import * as config from "../config.js";
import mongoose from "mongoose";

let superUserToken;
let superUser;
let spa;
let pet;

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

	pet = new Pet({ nom: "Pet1", description: "desc", age: 2, spa_id: spa._id });
	await pet.save();

	// Log in as the superuser to get a token
	const loginBody = { email: newSuperUser.email, password };
	const loginRes = await request(app).post("/users/login").send(loginBody);
	superUserToken = loginRes.body.token;
});

afterAll(async () => {
	await cleanUpDatabase();
	// close the database connection
	await mongoose.connection.close();
});

describe("Pets API, get pets", () => {
	it("should list all pets", async () => {
		const res = await request(app).get("/pets").set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty("nom", pet.nom);
		expect(res.body[0]).toHaveProperty("description", pet.description);
		expect(res.body[0]).toHaveProperty("age", pet.age);
	});
});

describe("Pets API, create pet", () => {
	it("should create a new pet", async () => {
		const newPet = { nom: "Pet2", description: "desc2", age: 3, spa_id: spa._id };
		const res = await request(app).post("/pets").set("Authorization", `Bearer ${superUserToken}`).send(newPet);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("_id");
		expect(res.body).toHaveProperty("nom", newPet.nom);
		expect(res.body).toHaveProperty("description", newPet.description);
		expect(res.body).toHaveProperty("age", newPet.age);

		const petInDb = await Pet.findById(res.body._id);
		expect(petInDb).not.toBeNull();
		expect(petInDb.nom).toEqual(newPet.nom);
		expect(petInDb.description).toEqual(newPet.description);
		expect(petInDb.age).toEqual(newPet.age);
	});

	it("should not create a pet with missing fields", async () => {
		const newPet = { nom: "Pet3" };
		const res = await request(app).post("/pets").set("Authorization", `Bearer ${superUserToken}`).send(newPet);
		expect(res.statusCode).toEqual(400);
	});
});

describe("Pets API, get by ID", () => {
	it("should get a pet by ID", async () => {
		const res = await request(app).get(`/pets/${pet._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("_id", pet._id.toString());
		expect(res.body).toHaveProperty("nom", pet.nom);
		expect(res.body).toHaveProperty("description", pet.description);
		expect(res.body).toHaveProperty("age", pet.age);
	});

	it("should return 404 for non-existing pet ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/pets/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Pets API, update pet", () => {
	it("should update a pet by ID", async () => {
		const updatedPet = { nom: "Pet2", description: "desc2", age: 3 };
		const res = await request(app)
			.put(`/pets/${pet._id}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updatedPet);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("nom", "Pet2");
		expect(res.body).toHaveProperty("description", "desc2");
		expect(res.body).toHaveProperty("age", 3);

		const petInDb = await Pet.findById(pet._id);
		expect(petInDb.nom).toEqual(updatedPet.nom);
		expect(petInDb.description).toEqual(updatedPet.description);
		expect(petInDb.age).toEqual(updatedPet.age);
	});

	it("should return 404 for non-existing pet ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const updatedPet = { nom: "Pet2", description: "desc2", age: 3 };
		const res = await request(app)
			.put(`/pets/${nonExistingId}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updatedPet);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Pets API, delete pet", () => {
	it("should delete a pet by ID", async () => {
		const res = await request(app).delete(`/pets/${pet._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(204);

		const petInDb = await Pet.findById(pet._id);
		expect(petInDb).toBeNull();
	});

	it("should return 404 for non-existing pet ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/pets/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});
