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
    });
});

// login
describe("Users API, login", () => {
    it("should login a user", async () => {
        const res = await request(app).post("/users/login").send(loginBody);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
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
    });

    it("should not create a user with an existing email", async () => {
        const newUser = { firstName: "John", lastName: "Doe", email: "admin@example.com", password: "password" };
        const res = await request(app).post("/users").send(newUser);
        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty("message", "Email already exists");
    });
});

describe("Users API, get by ID", () => {
    it("should get a user by ID", async () => {
        const res = await request(app).get(`/users/${superUser._id}`).set("Authorization", `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", superUser._id.toString());
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
});

describe("Users API, delete user", () => {
    it("should delete a user by ID", async () => {
        const res = await request(app).delete(`/users/${superUser._id}`).set("Authorization", `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(204);
    });

    it("should not delete a user without authorization", async () => {
        const newUser = { firstName: "John", lastName: "Doe", email: "john.doe@example.com", password: "password" };
        const createdUser = await request(app).post("/users").send(newUser);

        const res = await request(app).delete(`/users/${createdUser.body._id}`);
        expect(res.statusCode).toEqual(401);
    });
});
