import express from "express";
import { authenticate } from "../middleware/auth.js";
import { loadSpaByRequestId } from "../middleware/spa.js";
import Spa from "../models/spa.js";
import Pet from "../models/pet.js";

const router = express.Router();

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

router.post("/", authenticate, function (req, res, next) {
	const spa = new Spa({
		nom: req.body.nom,
		adresse: req.body.adresse,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		user_id: req.currentUserId,
	});

	spa
		.save()
		.then((newSpa) => {
			res.status(201).send(newSpa);
		})
		.catch((err) => {
			if (err.code === 11000) {
				res.status(409).send("Spa name already exists");
			}
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
