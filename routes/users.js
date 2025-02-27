import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";

import * as config from "../config.js";
import User from "../models/user.js";
import { authenticate } from "../middleware/auth.js";
import { checkSpaLink, loadUserByRequestId } from "../middleware/user.js";
import Adoption from "../models/adoption.js";
import Pet from "../models/pet.js";
import Spa from "../models/spa.js";

const signJwt = promisify(jwt.sign);

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
	try {
		const users = await User.find().sort("firstName").exec();
		res.status(200).send(users);
	} catch (err) {
		next(err);
	}
});

router.get("/isAuthenticated", authenticate, (req, res, next) => {
	try {
		res.status(200).send({ isAuthenticated: true });
	} catch (err) {
		next(err);
	}
});

router.get("/:id", authenticate, loadUserByRequestId, (req, res, next) => {
	try {
		res.status(200).send(req.user);
	} catch (err) {
		next(err);
	}
});

router.post("/", async (req, res, next) => {
	try {
		if (req.body.password) {
			try {
				req.body.password = await bcrypt.hash(req.body.password, config.bcryptCostFactor);
			} catch (err) {
				return next(err);
			}
		}
		const newUser = new User(req.body);
		const savedUser = await newUser.save();
		res.status(201).send(savedUser);
	} catch (err) {
		if (err.code === 11000) {
			res.status(409).send({ message: "Email already exists" });
		}
		// check if the error is due to a missing field
		if (err.name === "ValidationError") {
			res.status(400).send({ message: err.message });
		}
		next(err);
	}
});

router.put("/:id", authenticate, loadUserByRequestId, async (req, res, next) => {
	if (req.currentUserId !== req.params.id) {
		return res.status(403).send({ message: "You are not allowed to update this user" });
	}

	const user = req.user;
	user.firstName = req.body.firstName;
	user.lastName = req.body.lastName;
	user.email = req.body.email;

	if (req.body.password) {
		try {
			user.password = await bcrypt.hash(req.body.password, config.bcryptCostFactor);
		} catch (err) {
			return next(err);
		}
	}

	try {
		await user.save();
		res.status(200).send(user);
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).send({ message: "Email already exists" });
		}
		next(err);
	}
});

router.delete("/:id", authenticate, loadUserByRequestId, async (req, res, next) => {
	if (req.currentUserId !== req.params.id) {
		return res.status(403).send({ message: "You are not allowed to delete this user" });
	}

	try {
		// Delete user's adoptions
		await Adoption.deleteMany({ user_id: req.currentUserId });

		// Delete user's likes
		if (req.user.likes && req.user.likes.length > 0) {
			await Pet.updateMany({ _id: { $in: req.user.likes } }, { $inc: { likes_count: -1 } });
		}

		// Check if user is part of a spa and delete pets if so
		const spa = await Spa.findOne({ user_id: req.currentUserId }).exec();
		if (spa) {
			const pets = await Pet.find({ spa_id: spa._id }).exec();
			const petIds = pets.map((pet) => pet._id);
			await Pet.deleteMany({ spa_id: spa._id });
			await Adoption.deleteMany({ pet_id: { $in: petIds } });
			await Spa.deleteOne({ _id: spa._id });
		}

		// Delete user
		await User.deleteOne({ _id: req.currentUserId });
		res.sendStatus(204);
	} catch (err) {
		next(err);
	}
});

router.get("/:id/adoptions", authenticate, loadUserByRequestId, async (req, res, next) => {
	try {
		let adoptions = await Adoption.find({ user_id: req.currentUserId })
			.populate({
				path: "pet_id",
				populate: [
					{
						path: "spa_id",
						model: "Spa",
					},
				],
			})
			.exec();

		const spa = await Spa.findOne({ user_id: req.currentUserId }).exec();
		if (spa) {
			const spaAdoptions = await Adoption.find({
				pet_id: { $in: await Pet.find({ spa_id: spa._id }).select("_id").exec() },
			})
				.populate({
					path: "pet_id",
					populate: [
						{
							path: "spa_id",
							model: "Spa",
						},
					],
				})
				.populate("user_id")
				.exec();
			adoptions = adoptions.concat(spaAdoptions);
		}

		if (adoptions.length === 0) {
			return res.status(404).send({ message: "No adoptions found" });
		} else {
			adoptions = adoptions.sort((a, b) => {
				const dateA = a.messages.length > 0 ? a.messages.at(-1).date : new Date();
				const dateB = b.messages.length > 0 ? b.messages.at(-1).date : new Date();
				return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
			});
			res.status(200).send(adoptions);
		}
	} catch (err) {
		next(err);
	}
});

async function getPetsByPreference(req, res, next, preference) {
	try {
		const user = await User.findById(req.params.id)
			.populate({
				path: preference,
				match: { isAdopted: false },
				populate: [
					{ path: "tags", model: "Tag" },
					{ path: "spa_id", model: "Spa" },
				],
			})
			.exec();

		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.pageSize) || (parseInt(req.query.page) ? 3 : 0);

		const totalItems = user[preference].length;
		const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;

		const queryAggregation = [
			{ $match: { _id: { $in: user[preference] }, isAdopted: false } },
			{
				$lookup: {
					from: "tags",
					localField: "tags",
					foreignField: "_id",
					as: "tags",
				},
			},
			{
				$lookup: {
					from: "spas",
					localField: "spa_id",
					foreignField: "_id",
					as: "spa_id",
				},
			},
			{ $unwind: "$spa_id" }, // Unwind spa_id to convert array to object
			{
				$lookup: {
					from: "adoptions",
					let: { petId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $and: [{ $eq: ["$pet_id", "$$petId"] }, { $eq: ["$user_id", user._id] }] } } },
						{ $project: { _id: 1, status: 1 } },
					],
					as: "adoption",
				},
			},
			{
				$addFields: {
					adoptionId: { $arrayElemAt: ["$adoption._id", 0] },
					adoptionStatus: { $arrayElemAt: ["$adoption.status", 0] },
				},
			},
		];

		if (pageSize > 0) {
			queryAggregation.push({ $skip: (page - 1) * pageSize });
			queryAggregation.push({ $limit: pageSize });
			res.set({
				[`Pagination-Total-${preference.charAt(0).toUpperCase() + preference.slice(1)}`]: totalItems,
				"Pagination-Total-Pages": totalPages,
				"Pagination-Page-Size": pageSize,
				"Pagination-Page": page,
			});
		}

		const pets = await Pet.aggregate(queryAggregation).exec();

		res.status(200).send(pets);
	} catch (err) {
		next(err);
	}
}

router.get("/:id/likes", authenticate, (req, res, next) => {
	getPetsByPreference(req, res, next, "likes");
});

router.get("/:id/dislikes", authenticate, (req, res, next) => {
	getPetsByPreference(req, res, next, "dislikes");
});

router.post("/login", async (req, res, next) => {
	try {
		const user = await User.findOne({ email: req.body.email }).exec();
		if (!user) return res.status(401).send({ message: "Invalid email or password" });

		const valid = await bcrypt.compare(req.body.password, user.password);
		if (!valid) return res.status(401).send({ message: "Invalid email or password" });

		const exp = Math.floor(Date.now() / 1000 + 60 * 60 * 24);
		const token = await signJwt({ sub: user._id, exp: exp }, config.secret);
		const spa = await Spa.findOne({ user_id: user._id }).exec();
		const hasSpa = !!spa;
		res.status(200).send({ message: `Welcome ${user.email}!`, token, hasSpa });
	} catch (err) {
		next(err);
	}
});

router.get("/:id/spa", authenticate, checkSpaLink, function (req, res, next) {
	res.send(req.spa);
});

export default router;
