import express from "express";
import Pet from "../models/pet.js";
import Tag from "../models/tag.js";
import Spa from "../models/spa.js";

const router = express.Router();

router.get("/", function (req, res, next) {
	Pet.find()
    .populate("tags")
		.sort("dislikes_count")
		.exec()
		.then((pets) => {
			res.send(pets);
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id", function (req, res, next) {
	Pet.findById(req.params.id)
		.populate("tags")
		.populate("spa_id")
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			res.send(pet);
		})
		.catch((err) => {
			next(err);
		});
});

router.post("/", function (req, res, next) {
	const newPet = new Pet(req.body);
	newPet
		.save()
		.then((pet) => {
			res.status(201).send(pet);
		})
		.catch((err) => {
			next(err);
		});
});
router.patch("/:id", function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, req.body, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			res.send(pet);
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id", function (req, res, next) {
	Pet.findByIdAndDelete(req.params.id)
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			res.send("Pet deleted successfully");
		})
		.catch((err) => {
			next(err);
		});
});

router.put("/:id/like", function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, { $inc: { likes_count: 1 } }, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			res.send(pet);
		})
		.catch((err) => {
			next(err);
		});
});

router.put("/:id/dislike", function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, { $inc: { dislikes_count: 1 } }, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			res.send(pet);
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id/dislike", function (req, res, next) {
	res.send("Got a DELETE request from the pets route with id/dislike");
});

export default router;
