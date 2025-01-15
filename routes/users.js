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
		const plainTextPassword = req.body.password;
		const hash = await bcrypt.hash(plainTextPassword, config.bcryptCostFactor);
		req.body.password = hash;
		const newUser = new User(req.body);
		const savedUser = await newUser.save();
		res.status(201).send(savedUser);
	} catch (err) {
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
			// Duplicate key error
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
		await Adoption.deleteMany({ user_id: req.params.id });

		// Delete user's likes
		const user = await User.findById(req.params.id).exec();
		if (user.likes && user.likes.length > 0) {
			await Pet.updateMany({ _id: { $in: user.likes } }, { $inc: { likes_count: -1 } });
		}

		// Check if user is part of a spa and delete pets if so
		const spa = await Spa.findOne({ user_id: req.params.id }).exec();
		if (spa) {
			const pets = await Pet.find({ spa_id: spa._id }).exec();
			const petIds = pets.map((pet) => pet._id);
			await Pet.deleteMany({ _id: { $in: petIds } });
			await Adoption.deleteMany({ pet_id: { $in: petIds } });
			await Spa.deleteOne({ _id: spa._id });
		}

		// Delete user
		await User.deleteOne({ _id: req.params.id });
		res.status(204);
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

router.get("/:id/likes", authenticate, async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id)
			.populate({
				path: "likes",
				match: { isAdopted: false },
				populate: [
					{ path: "tags", model: "Tag" },
					{ path: "spa_id", model: "Spa" },
				],
			})
			.exec();

		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.pageSize) || 0;

		const totalLikes = user.likes.length;
		const totalPages = pageSize > 0 ? Math.ceil(totalLikes / pageSize) : 0;

		const pets = await Pet.aggregate([
			{ $match: { _id: { $in: user.likes }, isAdopted: false } },
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
				$project: {
					nom: 1,
					age: 1,
					description: 1,
					images: 1,
					tags: 1,
					spa_id: 1,
					likes_count: 1,
					dislikes_count: 1,
					adoptionId: { $arrayElemAt: ["$adoption._id", 0] },
					adoptionStatus: { $arrayElemAt: ["$adoption.status", 0] },
				},
			},
			{ $skip: (page - 1) * pageSize },
			{ $limit: pageSize },
		]).exec();

		// .find({ _id: { $in: user.likes }, isAdopted: false })
		// .populate([
		// 	{ path: "tags", model: "Tag" },
		// 	{ path: "spa_id", model: "Spa" },
		// ])
		// .skip((page - 1) * pageSize)
		// .limit(pageSize)
		// .exec();

		// const paginatedPets = pets.map((pet) => {
		// 	const adoption = adoptions.find((adoption) => adoption.pet_id.equals(pet._id));
		// 	return {
		// 		_id: pet._id,
		// 		nom: pet.nom,
		// 		age: pet.age,
		// 		description: pet.description,
		// 		images: pet.images,
		// 		tags: pet.tags,
		// 		spa_id: pet.spa_id,
		// 		likes_count: pet.likes_count,
		// 		dislikes_count: pet.dislikes_count,
		// 		adoptionId: adoption ? adoption._id : null,
		// 	};
		// });

		// delete pet from paginatedPets if the status is not pending or if the adoption is not found
		// paginatedPets.forEach((pet) => {
		// 	if (!pet.adoptionId) {
		// 		return;
		// 	}
		// 	const adoption = adoptions.find((adoption) => adoption._id.equals(pet.adoptionId));
		// 	if (adoption.status !== "pending") {
		// 		paginatedPets.splice(paginatedPets.indexOf(pet));
		// 	}
		// });

		res.set({
			"Pagination-Total-Likes": totalLikes,
			"Pagination-Total-Pages": totalPages,
			"Pagination-Page-Size": pageSize,
			"Pagination-Page": page,
		});

		res.status(200).send(pets);
	} catch (err) {
		next(err);
	}
});

router.get("/:id/dislikes", authenticate, async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id)
			.populate({
				path: "dislikes",
				match: { isAdopted: false },
				populate: [
					{ path: "tags", model: "Tag" },
					{ path: "spa_id", model: "Spa" },
				],
			})
			.exec();
		res.status(200).send(user.dislikes);
	} catch (err) {
		next(err);
	}
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
