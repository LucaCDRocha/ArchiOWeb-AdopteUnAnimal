// Importer les dépendances nécessaires
import mongoose from "mongoose";
import dotenv from "dotenv";
import Pet from "./models/pet.js";
import Spa from "./models/spa.js";
import User from "./models/user.js";
import Tag from "./models/tag.js";
import Adoption from "./models/adoption.js";
import fs from 'fs';
import path from 'path';

dotenv.config();

// Connexion à la base de données
mongoose.connect(
  process.env.DATABASE_URL || "mongodb://localhost/ArchiOWeb-AdopteUnAnimal"
);

const spaParis = new Spa({
  nom: "SPA de Paris",
	adresse: "Paris",
	latitude: 567,
	longitude: 1235,
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


const imageMorges = fs.readFileSync('Images/spaMorges_chien.jpg');
const imageParis = fs.readFileSync('Images/spaParis_chien.jpg');
const imageZurich = fs.readFileSync('Images/spaZurich_chien.jpg');


const chienToffee = new Pet({
  nom: "Toffee",
  age:12,
  description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
  images: [
    {
      data: imageParis,
      imgType: "image/jpeg",
    },
  ],
  tags: [tagChien._id],
  spa_id: spaParis._id,
  likes_count: 50,
  dislikes_count: 3,
});
const chienCara = new Pet({
  nom: "Cara",
  age:12,
  description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
  images: [
    {
      data: imageParis,
      imgType: "image/jpeg",
    },
  ],
  tags: [tagChien._id],
  spa_id: spaParis._id,
  likes_count: 5,
  dislikes_count: 3,
});
const chienBeth = new Pet({
  nom: "Bethany",
  age:10,
  description: "Un chien très mignon qui a 10 ans. Très calme et affectueuse, adore jouer avec les enfants",
  images: [
    {
      data: imageParis,
      imgType: "image/jpeg",
    },
  ],
  tags: [tagChien._id],
  spa_id: spaParis._id,
  likes_count: 5,
  dislikes_count: 3,
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
  likes_count: 80,
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
  likes_count: 80,
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
  likes_count: 8,
  dislikes_count: 10,
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
  likes_count: 80,
  dislikes_count: 10,
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
  likes_count: 20,
  dislikes_count: 5,
});
const chienCaline = new Pet({
  nom: "Caline",
  age: 1,
  description: "Caline est un chiot d'un ans qui adore les câlins et les balades. Elle est très affectueuse et aime jouer avec les enfants.", 
  images: [
    {
      data: imageZurich,
      imgType: "image/jpeg",
    },
  ],
  tags: [tagChien._id],
  spa_id: spaZurich._id,
  likes_count: 20,
  dislikes_count: 5,
});

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
chienToffee.save().then(() => console.log("Fini")).catch((error) => console.error("Erreur", error));

