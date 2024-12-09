// Importer les dépendances nécessaires
import mongoose from "mongoose";
import Pet from "../models/pet.js";
import Spa from "../models/spa.js";
import User from "../models/user.js";
import Tag from "../models/tag.js";
import Adoption from "../models/adoption.js";
import bcrypt from "bcrypt";
import * as config from "../config.js";
import fs from "fs";
import path from "path";

// Connexion à la base de données
mongoose.connect(config.databaseUrl);

const hashedPasswordParis = await bcrypt.hash("password123", config.bcryptCostFactor);
const userParis = new User({
	firstName: "Jane",
	lastName: "Doe",
	email: "jane.doe@example.com",
	password: hashedPasswordParis,
});

const hashedPasswordClient = await bcrypt.hash("password123", config.bcryptCostFactor);
const userclient = new User({
	firstName: "John",
	lastName: "Doe",
	email: "john.doe@example.com",
	password: hashedPasswordClient,
});
const spaParis = new Spa({
	nom: "SPA de Paris",
	adresse: "Paris",
	latitude: 567,
	longitude: 1235,
	user_id: userParis._id,
});

const spaMorges = new Spa({
	nom: "SPA de Morges",
	adresse: "Morges",
	latitude: 345,
	longitude: 1235,
});

const spaZurich = new Spa({
	nom: "SPA de Zurich",
	adresse: "Zurich",
	latitude: 345,
	longitude: 1235,
});

const tagChien = new Tag({
	nom: "Chien",
});

const imageMorges = fs.readFileSync("Images/spaMorges_chien.jpg");
const imageParis = fs.readFileSync("Images/spaParis_chien.jpg");
const imageZurich = fs.readFileSync("Images/spaZurich_chien.jpg");

const chienToffee = new Pet({
	nom: "Toffee",
	age: 12,
	description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
	images: [
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaParis._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienCara = new Pet({
	nom: "Cara",
	age: 12,
	description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
	images: [
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaParis._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienBeth = new Pet({
	nom: "Bethany",
	age: 10,
	description: "Un chien très mignon qui a 10 ans. Très calme et affectueuse, adore jouer avec les enfants",
	images: [
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaParis._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienArthur = new Pet({
	nom: "Arthur",
	age: 3,
	description: "Un chien très mignon qui a 3ans. Border Collie croisé avec golden retriever",
	images: [
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaMorges._id,
	likes_count: 1,
	dislikes_count: 0,
});
const chienMerlan = new Pet({
	nom: "Merlan",
	age: 3,
	description: "Un chien très mignon qui a 3ans. Border Collie croisé avec golden retriever",
	images: [
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaMorges._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienCookie = new Pet({
	nom: "Cookie",
	age: 1,
	description: "Un chiot de tout juste une année qui veut être aimée et être caressée.",
	images: [
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaMorges._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienBat = new Pet({
	nom: "Bat",
	age: 3,
	description: "Un chiot de tout juste 3 ans qui veut être aimée et être caressée.",
	images: [
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaZurich._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienJoie = new Pet({
	nom: "Joie",
	age: 1,
	description: "Un chiot de tout juste une année qui veut être aimée et être caressée.",
	images: [
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaZurich._id,
	likes_count: 0,
	dislikes_count: 0,
});
const chienCaline = new Pet({
	nom: "Caline",
	age: 1,
	description:
		"Caline est un chiot d'un ans qui adore les câlins et les balades. Elle est très affectueuse et aime jouer avec les enfants.",
	images: [
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id],
	spa_id: spaZurich._id,
	likes_count: 1,
	dislikes_count: 0,
});

const adoption = new Adoption({
	date: new Date(),
	user_id: userclient._id,
	pet_id: chienArthur._id,
	messages: [
		{
			content: "Je suis intéressé par l'adoption de ce chien.",
			date: new Date(),
			user_id: userclient._id,
		},
		{
			content: "Merci pour votre intérêt. Nous allons examiner votre demande.",
			date: new Date(),
			user_id: userParis._id,
		},
	],
});

const conversation2 = new Adoption({
	date: new Date(),
	user_id: userclient._id,
	pet_id: chienCookie._id,
	messages: [
		{
			content: "Bonjour, ce chiot est adorable, j'aimerais l'adopter.",
			date: new Date(),
			user_id: userclient._id,
		},
		{
			content: "Bonjour, merci pour votre intérêt. Nous allons examiner votre demande.",
			date: new Date(),
			user_id: userParis._id,
		},
		{
			content: "D'accord, savez-vous combien de temps ça prendra ?",
			date: new Date(),
			user_id: userclient._id,
		},
		{
			content: "Nous vous répondrons dans les plus brefs délais, d'ici 1 à 2 jours.",
			date: new Date(),
			user_id: userParis._id,
		},
	],
});

userclient.likes = [chienArthur._id];
// Supprimer toutes les collections existantes
await mongoose.connection.dropDatabase();
userParis.save();
userclient.save();
spaMorges.save();
spaParis.save();
spaZurich.save();
tagChien.save();
chienArthur.save();
chienMerlan.save();
chienCookie.save();
chienBat.save();
chienJoie.save();
chienCaline.save();
chienBeth.save();
chienCara.save();
adoption.save();
conversation2.save();

chienToffee
	.save()
	.then(() => {
		console.log("Fini");
		mongoose.connection.close();
	})
	.catch((error) => console.error("Erreur", error));