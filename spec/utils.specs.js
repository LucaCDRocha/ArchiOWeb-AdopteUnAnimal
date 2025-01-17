import User from "../models/user.js"
import Spa from "../models/spa.js"
import Adoption from "../models/adoption.js";
import Tag from "../models/tag.js";
import Pet from "../models/pet.js";

export const cleanUpDatabase = async function () {
    await Promise.all([
        User.deleteMany(),
        Spa.deleteMany(),
        Adoption.deleteMany(),
        Tag.deleteMany(),
        Pet.deleteMany()
    ]);
};