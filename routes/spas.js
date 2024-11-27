import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the spas route");
});

router.get("/:id", function (req, res, next) {
  res.send("Got a response from the spa route with id");
});

router.post("/", function (req, res, next) {
  res.send("Got a response from the spa route post");
});

router.get("/:id/pets", function (req, res, next) {
  res.send("Got a response from the spa route with all the pets");
});

router.put("/:id", function (req, res, next) {
  res.send("Got a response from the spa route to modify the spa");
});

router.delete("/:id", function (req, res, next) {
  res.send("Got a response from the spa route to delete the spa");
});

export default router;
