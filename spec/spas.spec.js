import request from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.specs.js";
import Spa from "../models/spa.js";
import User from "../models/user.js";
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
    });
});

describe("Spas API, create spa", () => {
    it("should create a new spa", async () => {
        const newSpa = { nom: "SPA2", adresse: "Address2", latitude: "46.0", longitude: "91.0" };
        const res = await request(app).post("/spas").set("Authorization", `Bearer ${superUserToken}`).send(newSpa);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("nom", newSpa.nom);

        const spaInDb = await Spa.findById(res.body._id);
        expect(spaInDb).not.toBeNull();
        expect(spaInDb.nom).toEqual(newSpa.nom);
    });
});

describe("Spas API, get by ID", () => {
    it("should get a spa by ID", async () => {

        const res = await request(app).get(`/spas/${spa._id}`).set("Authorization", `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", spa._id.toString());
        expect(res.body).toHaveProperty("nom", spa.nom);
    });
});

describe("Spas API, update spa", () => {
    it("should update a spa by ID", async () => {

        const updatedSpa = { nom: "SPA2", adresse: "Address2", latitude: "46.0", longitude: "91.0" };
        const res = await request(app).put(`/spas/${spa._id}`).set("Authorization", `Bearer ${superUserToken}`).send(updatedSpa);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("nom", "SPA2");

        const spaInDb = await Spa.findById(spa._id);
        expect(spaInDb.nom).toEqual(updatedSpa.nom);
    });
});

describe("Spas API, delete spa", () => {
    it("should delete a spa by ID", async () => {

        const res = await request(app).delete(`/spas/${spa._id}`).set("Authorization", `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(204);

        const spaInDb = await Spa.findById(spa._id);
        expect(spaInDb).toBeNull();
    });
});
