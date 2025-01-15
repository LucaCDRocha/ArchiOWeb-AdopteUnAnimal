import express from "express";
import { authenticate } from "../middleware/auth.js";
import { loadSpaByRequestId } from "../middleware/spa.js";
import Spa from "../models/spa.js";
import Pet from "../models/pet.js";

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
			res.status(409).send("Spa name already exists");
		}
		next(err);
	}
});

router.delete("/:id", authenticate, loadSpaByRequestId, async function (req, res, next) {
	try {
		await req.spa.deleteOne();
		res.status(204);
	} catch (err) {
		next(err);
	}
});

export default router;
