import express from "express";
import Pet from "../models/pet.js";
import User from "../models/user.js";
import { authenticate } from "./auth.js";
import Tag from "../models/tag.js";
import Spa from "../models/spa.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
	User.findById(req.currentUserId)
		.exec()
		.then((user) => {
			if (!user) {
				return res.status(404).send("User not found");
			}
			const excludedPets = [...user.likes, ...user.dislikes];
			Pet.find({ _id: { $nin: excludedPets } })
			.populate("spa_id")
				.populate("tags")
				.sort("dislikes_count")
				.exec()
				.then((pets) => {
					res.send(pets);
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id", authenticate, function (req, res, next) {
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

router.post("/", authenticate, function (req, res, next) {
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
router.patch("/:id", authenticate, function (req, res, next) {
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

router.delete("/:id", authenticate, function (req, res, next) {
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

router.put("/:id/like", authenticate, function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, { $inc: { likes_count: 1 } }, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			User.findByIdAndUpdate(req.currentUserId, { $addToSet: { likes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.send(pet);
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id/like", authenticate, function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, { $inc: { likes_count: -1 } }, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			User.findByIdAndUpdate(req.currentUserId, { $pull: { likes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.send(pet);
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

router.put("/:id/dislike", authenticate, function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, { $inc: { dislikes_count: 1 } }, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			User.findByIdAndUpdate(req.currentUserId, { $addToSet: { dislikes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.send(pet);
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id/dislike", authenticate, function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, { $inc: { dislikes_count: -1 } }, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send("Pet not found");
			}
			User.findByIdAndUpdate(req.currentUserId, { $pull: { dislikes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.send(pet);
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

export default router;
