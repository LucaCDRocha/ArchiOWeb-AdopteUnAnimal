import mongoose from "mongoose";
import * as config from "../config.js";
import { seedUsers } from "./seedUsers.js";
import { seedSpas } from "./seedSpas.js";
import { seedTags } from "./seedTags.js";
import { seedPets } from "./seedPets.js";
import { seedAdoptions } from "./seedAdoptions.js";
import { seedLikes } from "./seedLikes.js";

// Connexion à la base de données
mongoose.connect(config.databaseUrl);

// Supprimer toutes les collections existantes
await mongoose.connection.dropDatabase();

// Seed data
await seedUsers();
await seedSpas();
await seedTags();
await seedPets();
await seedAdoptions();
await seedLikes();

console.log("Fini");
mongoose.connection.close();
