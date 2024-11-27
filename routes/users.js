import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";

import * as config from "../config.js";
import User from "../models/user.js";
import { authenticate } from "./auth.js";

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

router.get("/:id", loadUserByRequestId, authenticate, function (req, res, next) {
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

router.put("/:id", loadUserByRequestId, authenticate, async function (req, res, next) {
	if (req.currentUserId !== req.params.id) {
		return res.sendStatus(403); // Forbidden
	}

	const user = req.user;
	user.firstName = req.body.firstName;
	user.lastName = req.body.lastName;
	try {
		await user.save();
		res.send(user);
	} catch (err) {
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

router.delete("/:id", function (req, res, next) {
	res.send("Got a DELETE request from the users route with id");
});

router.get("/:id/adoptions", function (req, res, next) {
	res.send("Got a response from the users route with id/adoptions");
});

router.get("/:id/likes", function (req, res, next) {
	res.send("Got a response from the users route with id/likes");
});

router.get("/:id/dislikes", function (req, res, next) {
	res.send("Got a response from the users route with id/dislikes");
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
