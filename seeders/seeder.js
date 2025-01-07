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
import sharp from "sharp";

// Connexion à la base de données
mongoose.connect(config.databaseUrl);

async function compressImage(imagePath) {
	return await sharp(imagePath).resize(300).jpeg({ quality: 80 }).toBuffer();
}

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
const tagChat = new Tag({
	nom: "Chat",
});
const tagLapin = new Tag({
	nom: "Lapin",
});
const tagJoueur = new Tag({
	nom: "Joueur",
});
const tagTurbulant = new Tag({
	nom: "Turbulant",
});
const tagCalme = new Tag({
	nom: "Calme",
});
const tagCurieux = new Tag({
	nom: "Curieux",
});


const imageMorges = await compressImage("Images/spaMorges_chien.jpg");
const imageParis = await compressImage("Images/spaParis_chien.jpg");
const imageZurich = await compressImage("Images/spaZurich_chien.jpg");
const imageChatKira = await compressImage("Images/chatKira.jpg");
const imageChatGouttiere = await compressImage("Images/chat-de-gouttiere.jpg");
const imageChaton = await compressImage("Images/chaton.jpg");
const imageLapin = await compressImage("Images/lapin.jpg");
const imageLapinou = await compressImage("Images/lapinou.jpeg");


const chienToffee = new Pet({
	nom: "Toffee",
	age: 12,
	description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
	images: [
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
	spa_id: spaMorges._id,
	likes_count: 1,
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
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageZurich,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
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
		{
			data: imageParis,
			imgType: "image/jpeg",
		},
		{
			data: imageMorges,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChien._id, tagJoueur._id],
	spa_id: spaZurich._id,
	likes_count: 1,
	dislikes_count: 0,
});
const chatKira = new Pet({
	nom: "Kira",
	age: 3,
	description: "Une chatte toute mignonne qui a 2 ans. Elle est très calme et adore les câlins.",
	images: [
		{
			data: imageChatKira,
			imgType: "image/jpeg",
		},
		{
			data: imageChatGouttiere,
			imgType: "image/jpeg",
		},
		{
			data: imageChaton,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChat._id, tagCalme._id],
	spa_id: spaParis._id,
	likes_count: 2,
	dislikes_count: 0,
});
const chatPito = new Pet({
	nom: "Pito",
	age: 8,
	description: "Un chat très mignon qui a 8 ans. Il est très joueur et curieux.",
	images: [
		{
			data: imageChatGouttiere,
			imgType: "image/jpeg",
		},
		{
			data: imageChatGouttiere,
			imgType: "image/jpeg",
		},
		{
			data: imageChaton,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChat._id, tagJoueur._id, tagCurieux._id, tagTurbulant._id],
	spa_id: spaMorges._id,
	likes_count: 1,
	dislikes_count: 3,
});
const chatMojito = new Pet({
	nom: "Mojito",
	age: 1,
	description: "Un chaton de tout juste une année qui veut être aimée et être caressée.",
	images: [
		{
			data: imageChaton,
			imgType: "image/jpeg",
		},
		{
			data: imageChatGouttiere,
			imgType: "image/jpeg",
		},
		{
			data: imageChatKira,
			imgType: "image/jpeg",
		},
	],
	tags: [tagChat._id, tagCalme],
	spa_id: spaMorges._id,
	likes_count: 3,
	dislikes_count: 0,
});
const lapinJojo = new Pet({
	nom: "Jojo",
	age: 2,
	description: "Un lapin très mignon qui a 2 ans. Il est très joueur et curieux.",
	images: [
		{
			data: imageLapin,
			imgType: "image/jpeg",
		},
		{
			data: imageLapinou,
			imgType: "image/jpeg",
		},
	],
	tags: [tagLapin._id, tagTurbulant, tagCurieux._id],
	spa_id: spaParis._id,
	likes_count: 1,
	dislikes_count: 1,
});
const lapinRoger = new Pet({
	nom: "Roger",
	age: 1,
	description: "Un lapin très mignon qui a 1 ans. Il est très joueur et curieux.",
	images: [
		{
			data: imageLapinou,
			imgType: "image/jpeg",
		},
		{
			data: imageLapin,
			imgType: "image/jpeg",
		},
	],
	tags: [tagLapin._id, tagJoueur, tagCurieux._id],
	spa_id: spaZurich._id,
	likes_count: 2,
	dislikes_count: 1,
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

userclient.likes = [chienArthur._id, chienCaline._id, chienMerlan._id];
// Supprimer toutes les collections existantes
await mongoose.connection.dropDatabase();
userParis.save();
userclient.save();
spaMorges.save();
spaParis.save();
spaZurich.save();
tagChien.save();
tagChat.save();
tagLapin.save();
tagJoueur.save();
tagTurbulant.save();
tagCalme.save();
tagCurieux.save();
chienArthur.save();
chienMerlan.save();
chienCookie.save();
chienBat.save();
chienJoie.save();
chienCaline.save();
chienBeth.save();
chienCara.save();
chatKira.save();
chatPito.save();
chatMojito.save();
lapinJojo.save();
lapinRoger.save();
adoption.save();
conversation2.save();

chienToffee
	.save()
	.then(() => {
		console.log("Fini");
		mongoose.connection.close();
	})
	.catch((error) => console.error("Erreur", error));