import express from "express";
import Pet from "../models/pet.js";
import User from "../models/user.js";
import Adoption from "../models/adoption.js";
import { authenticate } from "../middleware/auth.js";
import { checkSpaLink } from "../middleware/user.js";
import Tag from "../models/tag.js";
import Spa from "../models/spa.js";
import { calculateDistance } from "../utils/position.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
	User.findById(req.currentUserId)
		.exec()
		.then((user) => {
			if (!user) {
				return res.status(404).send({ message: "User not found" });
			}
			const excludedPets = [...user.likes, ...user.dislikes];
			const tagFilter = req.query.tags ? { tags: { $all: req.query.tags.split(",") } } : {};
			Pet.find({ _id: { $nin: excludedPets }, ...tagFilter, isAdopted: false })
				.populate("spa_id")
				.populate("tags")
				.sort("-dislikes_count")
				.exec()
				.then((pets) => {
					const { latitude, longitude } = req.query;
					if (latitude && longitude) {
						const sortedPets = pets.sort((a, b) => {
							const distanceA = calculateDistance({ latitude, longitude }, a.spa_id);
							const distanceB = calculateDistance({ latitude, longitude }, b.spa_id);
							return distanceA - distanceB;
						});
						res.status(200).send(sortedPets);
					} else {
						res.status(200).send(pets);
					}
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
				return res.status(404).send({ message: "Pet not found" });
			}
			res.status(200).send(pet);
		})
		.catch((err) => {
			next(err);
		});
});

router.post("/", authenticate, checkSpaLink, function (req, res, next) {
	const newPet = new Pet({
		...req.body,
		spa_id: req.spa._id,
		likes_count: 0,
		dislikes_count: 0,
	});
	newPet
		.save()
		.then((pet) => {
			res.status(201).send(pet);
		})
		.catch((err) => {
			// check if the error is due to a missing field
			if (err.name === "ValidationError") {
				res.status(400).send({ message: err.message });
			}
			next(err);
		});
});

router.put("/:id", authenticate, checkSpaLink, function (req, res, next) {
	Pet.findByIdAndUpdate(req.params.id, req.body, { new: true })
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send({ message: "Pet not found" });
			}
			res.status(200).send(pet);
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id", authenticate, checkSpaLink, function (req, res, next) {
	Pet.findByIdAndDelete(req.params.id)
		.exec()
		.then((pet) => {
			if (!pet) {
				return res.status(404).send({ message: "Pet not found" });
			}
			// Cascade delete adoptions related to the pet
			User.updateMany({ likes: req.params.id }, { $pull: { likes: req.params.id } }).exec();
			return Adoption.deleteMany({ pet_id: req.params.id }).exec();
		})
		.then(() => {
			res.sendStatus(204);
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
				return res.status(404).send({ message: "Pet not found" });
			}
			User.findByIdAndUpdate(req.currentUserId, { $addToSet: { likes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.status(200).send(pet);
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
				return res.status(404).send({ message: "Pet not found" });
			}
			User.findByIdAndUpdate(req.currentUserId, { $pull: { likes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					Adoption.findOneAndDelete({ pet_id: req.params.id, user_id: req.currentUserId })
						.exec()
						.then(() => {
							res.sendStatus(204);
						})
						.catch((err) => {
							next(err);
						});
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
				return res.status(404).send({ message: "Pet not found" });
			}
			User.findByIdAndUpdate(req.currentUserId, { $addToSet: { dislikes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.status(200).send(pet);
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
				return res.status(404).send({ message: "Pet not found" });
			}
			User.findByIdAndUpdate(req.currentUserId, { $pull: { dislikes: pet._id } }, { new: true })
				.exec()
				.then((user) => {
					res.status(200).send(pet);
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id/adoptions", authenticate, async (req, res, next) => {
	try {
		const adoptions = await Adoption.find({ pet_id: req.params.id })
			.populate("user_id")
			.populate({
				path: "pet_id",
				populate: { path: "spa_id" },
			})
			.exec();
		res.status(200).send(adoptions);
	} catch (err) {
		next(err);
	}
});

export default router;
