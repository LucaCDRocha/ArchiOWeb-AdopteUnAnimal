import express from "express";
import Adoption from "../models/adoption.js";
import User from "../models/user.js";
import Pet from "../models/pet.js";
import { authenticate } from "../middleware/auth.js";
import { wsSend } from "../websocket/websocket.js"; // Import the WebSocket status update function
import { checkSpaLink } from "../middleware/user.js";
import { loadAdoptionByRequestId } from "../middleware/adoption.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
	Adoption.find()
		.populate("user_id")
		.populate({
			path: "pet_id",
			populate: [
				{
					path: "spa_id",
					model: "Spa",
				},
			],
		})
		.exec()
		.then((adoptions) => {
			res.status(200).send(adoptions);
		})
		.catch((err) => {
			next(err);
		});
});

router.post("/", authenticate, function (req, res, next) {
	Adoption.findOne({ user_id: req.currentUserId, pet_id: req.body.pet_id })
		.exec()
		.then((existingAdoption) => {
			if (existingAdoption) {
				res.status(409).send(existingAdoption);
				return;
			}
			const newAdoption = new Adoption({
				user_id: req.currentUserId,
				pet_id: req.body.pet_id,
				messages: [],
				date: new Date(),
			});
			return newAdoption.save();
		})
		.then((adoption) => {
			if (adoption) {
				res.status(201).send(adoption);
			}
		})
		.catch((err) => {
			// check if the error is due to a missing field
			if (err.name === "ValidationError") {
				res.status(400).send({ message: err.message });
			}
			next(err);
		});
});

router.get("/:id", authenticate, loadAdoptionByRequestId, function (req, res, next) {
	try {
		const adoption = req.adoption;
		if (
			adoption.user_id._id.toString() !== req.currentUserId &&
			adoption.pet_id.spa_id.user_id.toString() !== req.currentUserId
		) {
			return res.status(403).send({ message: "Unauthorized" });
		}
		res.status(200).send(adoption);
	} catch (err) {
		next(err);
	}
});

router.delete("/:id", authenticate, checkSpaLink, loadAdoptionByRequestId, function (req, res, next) {
	const adoption = req.adoption;
	if (adoption.pet_id.spa_id._id.toString() !== req.spa._id.toString()) {
		return res.status(403).send({ message: "Unauthorized" });
	}
	adoption
		.deleteOne()
		.then(() => {
			res.status(204).send();
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/:id/messages", authenticate, loadAdoptionByRequestId, function (req, res, next) {
	try {
		res.status(200).send(req.adoption.messages);
	} catch (err) {
		next(err);
	}
});

router.post("/:id/messages", authenticate, loadAdoptionByRequestId, async function (req, res, next) {
	try {
		const adoption = req.adoption;
		const message = {
			content: req.body.content,
			user_id: req.currentUserId,
			date: new Date(),
		};
		adoption.messages.push(message);
		const updatedAdoption = await adoption.save();
		const newMessage = updatedAdoption.messages[updatedAdoption.messages.length - 1];
		wsSend("addMessage", req.params.id, newMessage);
		res.status(201).send(updatedAdoption.messages);
	} catch (err) {
		next(err);
	}
});

router.delete("/:id/messages/:msg_id", authenticate, loadAdoptionByRequestId, async function (req, res, next) {
	try {
		const adoption = req.adoption;
		const messageIndex = adoption.messages.findIndex((msg) => msg._id.toString() === req.params.msg_id);
		if (messageIndex === -1) {
			return res.status(404).send({ message: "Message not found" });
		}
		const deletedMessage = adoption.messages[messageIndex];
		adoption.messages.splice(messageIndex, 1);
		const updatedAdoption = await adoption.save();
		wsSend("deleteMessage", req.params.id, deletedMessage);
		res.status(200).send(updatedAdoption.messages);
	} catch (err) {
		next(err);
	}
});

router.put("/:id/status", authenticate, checkSpaLink, loadAdoptionByRequestId, async function (req, res, next) {
	try {
		const adoption = req.adoption;
		const previousStatus = adoption.status;

		if (req.body.status === "accepted") {
			const existingAcceptedAdoption = await Adoption.findOne({
				pet_id: adoption.pet_id,
				status: "accepted",
			}).exec();
			if (existingAcceptedAdoption) {
				return res.status(409).send({ message: "This pet has already been adopted." });
			}
		}

		adoption.status = req.body.status;

		if (req.body.status !== "unavailable") {
			switch (previousStatus) {
				case "pending":
					switch (req.body.status) {
						case "accepted":
							await Pet.findByIdAndUpdate(adoption.pet_id, { isAdopted: true }, { new: true }).exec();
							await Adoption.updateMany(
								{ pet_id: adoption.pet_id, status: "pending" },
								{ status: "unavailable" }
							).exec();
							break;
						case "rejected":
							await Pet.findByIdAndUpdate(adoption.pet_id, { isAdopted: false }, { new: true }).exec();
							break;
						default:
							return res.status(400).send({ message: "Invalid status transition" });
					}
					break;
				case "accepted":
					switch (req.body.status) {
						case "pending":
							await Pet.findByIdAndUpdate(adoption.pet_id, { isAdopted: false }, { new: true }).exec();
							await Adoption.updateMany(
								{ pet_id: adoption.pet_id, status: "unavailable" },
								{ status: "pending" }
							).exec();
							break;
						case "rejected":
							await Pet.findByIdAndUpdate(adoption.pet_id, { isAdopted: false }, { new: true }).exec();
							await Adoption.updateMany(
								{ pet_id: adoption.pet_id, status: "unavailable" },
								{ status: "pending" }
							).exec();
							break;
						default:
							return res.status(400).send({ message: "Invalid status transition" });
					}
					break;
				case "rejected":
					switch (req.body.status) {
						case "pending":
							await Pet.findByIdAndUpdate(adoption.pet_id, { isAdopted: false }, { new: true }).exec();
							break;
						case "accepted":
							await Pet.findByIdAndUpdate(adoption.pet_id, { isAdopted: true }, { new: true }).exec();
							await Adoption.updateMany(
								{ pet_id: adoption.pet_id, status: "pending" },
								{ status: "unavailable" }
							).exec();
							break;
						default:
							return res.status(400).send({ message: "Invalid status transition" });
					}
					break;
				case "unavailable":
					return res.status(400).send({ message: "Cannot change status from unavailable" });
				default:
					return res.status(400).send({ message: "Invalid previous status" });
			}
		} else {
			return res.status(400).send({ message: "Cannot change status to unavailable" });
		}

		await adoption.save();
		wsSend("statusUpdate", adoption._id, adoption.status);
		res.status(200).send(adoption);
	} catch (err) {
		next(err);
	}
});

export default router;
