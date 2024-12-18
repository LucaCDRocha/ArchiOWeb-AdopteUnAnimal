import express from "express";
import { authenticate } from "./auth.js";
import Tag from "../models/tag.js";

const router = express.Router();

router.get("/", function (req, res, next) {
    Tag.find()
        .sort("name")
        .exec()
        .then((tags) => {
            res.send(tags);
        })
        .catch((err) => {
            next(err);
        });
});

export default router;
