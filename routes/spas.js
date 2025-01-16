import express from "express";
import { authenticate } from "../middleware/auth.js";
import { loadSpaByRequestId } from "../middleware/spa.js";
import Spa from "../models/spa.js";
import Pet from "../models/pet.js";
import Adoption from "../models/adoption.js";
import User from "../models/user.js";
import { checkSpaLink } from "../middleware/user.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
	Spa.find()
		.sort("nom")
		.exec()
		.then((spas) => {
			res.status(200).send(spas);
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id", authenticate, loadSpaByRequestId, function (req, res, next) {
	try {
		res.status(200).send(req.spa);
	} catch (err) {
		next(err);
	}
});

router.post("/", authenticate, function (req, res, next) {
	const newSpa = new Spa(req.body);
	newSpa
		.save()
		.then((spa) => {
			res.status(201).send(spa);
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id/pets", authenticate, loadSpaByRequestId, function (req, res, next) {
	Pet.find({ spa_id: req.spa._id })
		.sort("name")
		.populate("tags")
		.populate("spa_id")
		.exec()
		.then((pets) => {
			res.status(200).send(pets);
		})
		.catch((err) => {
			next(err);
		});
});

router.put("/:id", authenticate, loadSpaByRequestId, async function (req, res, next) {
	const spa = req.spa;
	spa.nom = req.body.nom;
	spa.addresse = req.body.addresse;

	try {
		const updatedSpa = await spa.save();
		res.status(200).send(updatedSpa);
	} catch (err) {
		if (err.code === 11000) {
			res.status(409).send({ message: "Spa name already exists" });
		}
		next(err);
	}
});

router.delete("/:id", authenticate, loadSpaByRequestId, checkSpaLink, async function (req, res, next) {
	try {
		const spaId = req.spa._id;
		// Delete pets associated with the spa
		const pets = await Pet.find({ spa_id: spaId });
		const petIds = pets.map(pet => pet._id);
		await Pet.deleteMany({ spa_id: spaId });

		// Delete adoptions associated with the pets
		await Adoption.deleteMany({ pet_id: { $in: petIds } });

		// Remove pet ids from users' likes and dislikes
		await User.updateMany(
			{ likes: { $in: petIds } },
			{ $pull: { likes: { $in: petIds } } }
		);
		await User.updateMany(
			{ dislikes: { $in: petIds } },
			{ $pull: { dislikes: { $in: petIds } } }
		);

		// Delete the spa
		await req.spa.deleteOne();
		res.sendStatus(204);
	} catch (err) {
		next(err);
	}
});

export default router;
