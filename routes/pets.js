import express from "express";
import Pet from "../models/pet.js";

const router = express.Router();

router.get("/", function (req, res, next) {
	Pet.find()
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
	res.send("Got a response from the pets route with id");
});

router.post("/", function (req, res, next) {
	res.send("Got a POST request from the pets route");
});

router.patch("/:id", function (req, res, next) {
	res.send("Got a PATCH request from the pets route with id");
});

router.delete("/:id", function (req, res, next) {
	res.send("Got a DELETE request from the pets route with id");
});

router.put("/:id/like", function (req, res, next) {
	res.send("Got a PUT request from the pets route with id/like");
});

router.put("/:id/dislike", function (req, res, next) {
	res.send("Got a PUT request from the pets route with id/dislike");
});

router.delete("/:id/like", function (req, res, next) {
	res.send("Got a DELETE request from the pets route with id/like");
});

router.delete("/:id/dislike", function (req, res, next) {
	res.send("Got a DELETE request from the pets route with id/dislike");
});

export default router;
