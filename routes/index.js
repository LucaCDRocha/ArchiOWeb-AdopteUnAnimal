import express from "express";
import Pet from "../models/pet.js";
const router = express.Router();

router.get("/", function (req, res, next) {
  Pet.find()
    .then((pets) => {
      res.send(
        `<img src="data:image/jpeg;base64,${pets[0].images[0].data.toString(
          "base64"
        )}" alt="Pet Image" height="50%">`
      );
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

export default router;
