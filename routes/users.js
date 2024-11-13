import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
	res.send("Got a response from the users route");
});

router.get("/:id", function (req, res, next) {
	res.send("Got a response from the users route with id");
});

router.post("/", function (req, res, next) {
	res.send("Got a POST request from the users route");
});

router.patch("/:id", function (req, res, next) {
	res.send("Got a PATCH request from the users route with id");
});

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

export default router;
