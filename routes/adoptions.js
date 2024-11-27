import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the adoptions route");
});

router.post("/adoptions", function (req, res, next) {
  res.send("Got a POST request at /adoptions");
});

router.get("/adoptions", function (req, res, next) {
  res.send("Got a GET request at /adoptions");
});

router.get("/adoptions/:id", function (req, res, next) {
  res.send("Got a response from the adoptions route with id");
});

router.delete("/adoptions/:id", function (req, res, next) {
  res.send("Got a response from the adoptions route with id");
});

router.get("/adoptions/:id/messages", function (req, res, next) {
  res.send("Got a response from the adoptions route with id and messages");
});

router.post("/adoptions/:id/messages", function (req, res, next) {
  res.send("Got a response from the adoptions route with id and messages");
});

router.delete("/adoptions/:id/messages/:msg_id", function (req, res, next) {
  res.send("Got a response from the adoptions route with id and messages");
});

export default router;
