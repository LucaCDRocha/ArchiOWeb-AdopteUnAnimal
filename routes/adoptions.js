import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the adoptions route");
});

export default router;
