import express from "express";
import { authenticate } from "./auth.js";
import Spa from "../models/spa.js";
import Pet from "../models/pet.js";

const router = express.Router();

// Middleware to load Spa by request ID
async function loadSpaByRequestId(req, res, next) {
	try {
		const spa = await Spa.findById(req.params.id).exec();
		if (!spa) {
			return res.status(404).send("Spa not found");
		}
		req.spa = spa;
		next();
	} catch (err) {
		next(err);
	}
}

router.get("/", function (req, res, next) {
	Spa.find()
		.sort("nom")
		.exec()
		.then((spas) => {
			res.send(spas);
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id", loadSpaByRequestId, function (req, res) {
	try {
		res.send(req.spa);
	} catch (err) {
		next(err);
	}
});

router.post("/", function (req, res, next) {
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

router.get("/:id/pets", loadSpaByRequestId, function (req, res) {
	Pet.find({ spa_id: req.spa._id })
		.sort("name")
		.exec()
		.then((pets) => {
			res.send(pets);
		})
		.catch((err) => {
			next(err);
		});
});

router.put("/:id", loadSpaByRequestId, async function (req, res) {
	const spa = req.spa;
	spa.nom = req.body.nom;
	spa.addresse = req.body.addresse;

	try {
		const updatedSpa = await spa.save();
		res.send(updatedSpa);
	} catch (err) {
		if (err.code === 11000) {
			res.status(409).send("Spa name already exists");
		}
		next(err);
	}
});

router.delete("/:id", loadSpaByRequestId, async function (req, res) {
	try {
		await req.spa.deleteOne();
		res.sendStatus(204); // No Content
	} catch (err) {
		next(err);
	}
});

export default router;
