import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
	res.send("Got a response from the pets route");
});

router.get("/:id", function (req, res, next) {
	res.send("Got a response from the pets route with id");
});

export default router;
