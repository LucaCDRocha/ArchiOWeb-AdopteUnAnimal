import request from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.specs.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import * as config from "../config.js";
import mongoose from "mongoose";

let superUser;
let superUserToken;
let loginBody;

beforeEach(async () => {
	await cleanUpDatabase();

	// Create a superuser
	const password = "adminpassword";
	const hashedPassword = await bcrypt.hash("adminpassword", config.bcryptCostFactor);
	const newSuperUser = await User.create({
		firstName: "Admin",
		lastName: "User",
		email: "admin@example.com",
		password: hashedPassword,
	});
	newSuperUser.save();
	superUser = newSuperUser;

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

describe("Users API, get user", () => {
	it("should list all users", async () => {
		const res = await request(app).get("/users").set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty("firstName", superUser.firstName);
		expect(res.body[0]).toHaveProperty("lastName", superUser.lastName);
		expect(res.body[0]).toHaveProperty("email", superUser.email);
	});
});

describe("Users API, login", () => {
	it("should login a user", async () => {
		const res = await request(app).post("/users/login").send(loginBody);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("token");
		expect(res.body).toHaveProperty("message", `Welcome ${superUser.email}!`);
	});

	it("should not login with incorrect password", async () => {
		const res = await request(app).post("/users/login").send({ email: superUser.email, password: "wrongpassword" });
		expect(res.statusCode).toEqual(401);
		expect(res.body).toHaveProperty("message", "Invalid email or password");
	});

	it("should not login with non-existing email", async () => {
		const res = await request(app).post("/users/login").send({ email: "nonexistent@example.com", password: "password" });
		expect(res.statusCode).toEqual(401);
		expect(res.body).toHaveProperty("message", "Invalid email or password");
	});
});

describe("Users API, create user", () => {
	it("should create a new user", async () => {
		const newUser = { firstName: "John", lastName: "Doe", email: "john.doe@example.com", password: "password" };
		const res = await request(app).post("/users").send(newUser);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("_id");
		expect(res.body).toHaveProperty("firstName", "John");
		expect(res.body).toHaveProperty("lastName", "Doe");
		expect(res.body).toHaveProperty("email", "john.doe@example.com");
		expect(res.body).not.toHaveProperty("password"); // Password should not be returned

		const userInDb = await User.findById(res.body._id);
		expect(userInDb).not.toBeNull();
		expect(userInDb.firstName).toEqual(newUser.firstName);
		expect(userInDb.lastName).toEqual(newUser.lastName);
		expect(userInDb.email).toEqual(newUser.email);
	});

	it("should not create a user with an existing email", async () => {
		const newUser = { firstName: "John", lastName: "Doe", email: "admin@example.com", password: "password" };
		const res = await request(app).post("/users").send(newUser);
		expect(res.statusCode).toEqual(409);
		expect(res.body).toHaveProperty("message", "Email already exists");
	});

	it("should not create a user with missing fields", async () => {
		const newUser = { firstName: "John" };
		const res = await request(app).post("/users").send(newUser);
		expect(res.statusCode).toEqual(400);
	});
});

describe("Users API, get by ID", () => {
	it("should get a user by ID", async () => {
		const res = await request(app).get(`/users/${superUser._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("_id", superUser._id.toString());
		expect(res.body).toHaveProperty("firstName", superUser.firstName);
		expect(res.body).toHaveProperty("lastName", superUser.lastName);
		expect(res.body).toHaveProperty("email", superUser.email);
	});

	it("should return 404 for non-existing user ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/users/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});

describe("Users API, update user", () => {
	it("should update a user by ID", async () => {
		const updateBody = { firstName: "Jane", lastName: "Doe", email: "jane.doe@example.com", password: "password" };
		const res = await request(app)
			.put(`/users/${superUser._id}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updateBody);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("firstName", "Jane");
		expect(res.body).toHaveProperty("lastName", "Doe");
		expect(res.body).toHaveProperty("email", "jane.doe@example.com");

		const userInDb = await User.findById(superUser._id);
		expect(userInDb.firstName).toEqual(updateBody.firstName);
		expect(userInDb.lastName).toEqual(updateBody.lastName);
		expect(userInDb.email).toEqual(updateBody.email);
	});

	it("should not update a user with an existing email", async () => {
		const newUser = { firstName: "John", lastName: "Smith", email: "john.smith@example.com", password: "password" };
		await request(app).post("/users").send(newUser);

		const updateBody = { firstName: "Jane", lastName: "Doe", email: "john.smith@example.com", password: "password" };
		const res = await request(app)
			.put(`/users/${superUser._id}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updateBody);
		expect(res.statusCode).toEqual(409);
		expect(res.body).toHaveProperty("message", "Email already exists");
	});

	it("should return 403 for updating another user", async () => {
		const newUser = { firstName: "John", lastName: "Doe", email: "john.doe@example.com", password: "password" };
		const createdUser = await request(app).post("/users").send(newUser);

		const updateBody = { firstName: "Jane", lastName: "Doe", email: "jane.doe@example.com", password: "password" };
		const res = await request(app)
			.put(`/users/${createdUser.body._id}`)
			.set("Authorization", `Bearer ${superUserToken}`)
			.send(updateBody);
		expect(res.statusCode).toEqual(403);
		expect(res.body).toHaveProperty("message", "You are not allowed to update this user");
	});
});

describe("Users API, delete user", () => {
	it("should delete a user by ID", async () => {
		const res = await request(app).delete(`/users/${superUser._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(204);

		const userInDb = await User.findById(superUser._id);
		expect(userInDb).toBeNull();
	});

	it("should return 403 for deleting another user", async () => {
		const newUser = { firstName: "John", lastName: "Doe", email: "john.doe@example.com", password: "password" };
		const createdUser = await request(app).post("/users").send(newUser);

		const res = await request(app).delete(`/users/${createdUser.body._id}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(403);
		expect(res.body).toHaveProperty("message", "You are not allowed to delete this user");
	});

	it("should return 404 for non-existing user ID", async () => {
		const nonExistingId = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/users/${nonExistingId}`).set("Authorization", `Bearer ${superUserToken}`);
		expect(res.statusCode).toEqual(404);
	});
});
