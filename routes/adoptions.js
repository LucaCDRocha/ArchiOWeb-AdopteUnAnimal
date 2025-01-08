import express from "express";
import Adoption from "../models/adoption.js";
import User from "../models/user.js";
import Pet from "../models/pet.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
  Adoption.find({ user_id: req.currentUserId})
    .populate({
			path: "pet_id",
			populate: [
				{
					path: "spa_id",
					model: "Spa"
				}
			]
		})
    .exec()
    .then((adoptions) => {
      res.status(200).send(adoptions);
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/", function (req, res, next) {
	const newAdoption = new Adoption(req.body);
	newAdoption
		.save()
		.then((adoption) => {
			res.status(201).send(adoption);
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id", authenticate, function (req, res, next) {
	Adoption.findById(req.params.id)
		.populate("user_id")
		.populate({
			path: "pet_id",
			populate: [
				{
					path: "spa_id",
					model: "Spa"
				}
			]
		})
		.exec()
		.then((adoption) => {
			if (!adoption) {
				return res.status(404).send("Adoption not found");
			}
			res.status(200).send(adoption);
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id", authenticate, function (req, res, next) {
	Adoption.findByIdAndDelete(req.params.id)
		.exec()
		.then((adoption) => {
			if (!adoption) {
				return res.status(404).send("Adoption not found");
			}
			res.status(200).send("Adoption deleted successfully");
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id/messages", authenticate, function (req, res, next) {
	Adoption.findById(req.params.id)
		.populate("messages.user_id")
		.exec()
		.then((adoption) => {
			if (!adoption) {
				return res.status(404).send("Adoption not found");
			}
			res.status(200).send(adoption.messages);
		})
		.catch((err) => {
			next(err);
		});
});

router.post("/:id/messages", authenticate, function (req, res, next) {
	Adoption.findById(req.params.id)
		.exec()
		.then((adoption) => {
			if (!adoption) {
				return res.status(404).send("Adoption not found");
			}
			adoption.messages.push(req.body);
			return adoption.save().then((updatedAdoption) => {
				res.status(201).send(updatedAdoption.messages);
			});
		})
		.catch((err) => {
			next(err);
		});
});

router.delete("/:id/messages/:msg_id", authenticate, function (req, res, next) {
	Adoption.findById(req.params.id)
		.exec()
		.then((adoption) => {
			if (!adoption) {
				return res.status(404).send("Adoption not found");
			}
			const messageIndex = adoption.messages.findIndex((msg) => msg._id.toString() === req.params.msg_id);
			if (messageIndex === -1) {
				return res.status(404).send("Message not found");
			}
			adoption.messages.splice(messageIndex, 1);
			return adoption.save().then((updatedAdoption) => {
				res.status(200).send(updatedAdoption.messages);
			});
		})
		.catch((err) => {
			next(err);
		});
});

export default router;
