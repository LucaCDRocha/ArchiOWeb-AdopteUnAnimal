import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";

import * as config from "../config.js";
import User from "../models/user.js";
import { authenticate } from "./auth.js";
import Adoption from "../models/adoption.js";
import Pet from "../models/pet.js";

const signJwt = promisify(jwt.sign);

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
	User.find()
		.sort("firstName")
		.exec()
		.then((users) => {
			res.send(users);
		})
		.catch((err) => {
			next(err);
		});
});

router.get("/isAuthenticated", authenticate, function (req, res, next) {
	try {
		res.send({ isAuthenticated: true });
	} catch (err) {
		next(err);
	}
});

router.get("/:id", authenticate, loadUserByRequestId, function (req, res, next) {
	try {
		res.send(req.user);
	} catch (err) {
		next(err);
	}
});

router.post("/", function (req, res, next) {
	const plainTextPassword = req.body.password;

	bcrypt
		.hash(plainTextPassword, config.bcryptCostFactor)
		.then((hash) => {
			req.body.password = hash;
			const newUser = new User(req.body);

			return newUser.save().then((savedUser) => {
				res.send(savedUser);
			});
		})
		.catch((err) => {
			next(err);
		});
});

router.put("/:id", authenticate, loadUserByRequestId, async function (req, res, next) {
	if (req.currentUserId !== req.params.id) {
		return res.sendStatus(403); // Forbidden
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
		res.send(user);
	} catch (err) {
		if (err.code === 11000) {
			// Duplicate key error
			return res.status(409).send({ message: "Email already exists" });
		}
		next(err);
	}
});

async function loadUserByRequestId(req, res, next) {
	const user = await User.findById(req.params.id);
	if (user === null) {
		return res.sendStatus(404);
	}

	req.user = user;
	next();
}

router.delete("/:id", authenticate, loadUserByRequestId, async function (req, res, next) {
	if (req.currentUserId !== req.params.id) {
		return res.sendStatus(403); // Forbidden
	}

	try {
		await User.deleteOne({ _id: req.params.id });
		res.sendStatus(204); // No Content
	} catch (err) {
		next(err);
	}
});

router.get("/:id/adoptions", authenticate, loadUserByRequestId, function (req, res, next) {
	User.findById(req.params.id)
		.populate("adoptions")
		.exec()
		.then((user) => {
			res.send(user.adoptions);
		})
		.catch(next);
});

router.get("/:id/likes", authenticate, loadUserByRequestId, function (req, res, next) {
	User.findById(req.params.id)
		.populate("likes")
		.exec()
		.then((user) => {
			res.send(user.likes);
		})
		.catch(next);
});

router.get("/:id/dislikes", authenticate, loadUserByRequestId, function (req, res, next) {
	User.findById(req.params.id)
		.populate("dislikes")
		.exec()
		.then((user) => {
			res.send(user.dislikes);
		})
		.catch(next);
});

router.post("/login", function (req, res, next) {
	User.findOne({ email: req.body.email })
		.exec()
		.then((user) => {
			if (!user) return res.sendStatus(401); // Unauthorized
			return bcrypt.compare(req.body.password, user.password).then((valid) => {
				if (!valid) return res.sendStatus(401); // Unauthorized
				// Login is valid...
				const exp = Math.floor(Date.now() / 1000 + 60 * 60 * 24);
				return signJwt({ sub: user._id, exp: exp }, config.secret).then((token) => {
					res.send({ message: `Welcome ${user.email}!`, token });
				});
			});
		})
		.catch(next);
});

export default router;
