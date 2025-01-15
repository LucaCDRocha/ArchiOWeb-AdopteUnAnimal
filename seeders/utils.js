import User from "../models/user.js";
import Spa from "../models/spa.js";
import Tag from "../models/tag.js";
import Pet from "../models/pet.js";
import sharp from "sharp";

export async function getUserByEmail(email) {
	return await User.findOne({ email });
}

export async function getSpaByName(name) {
	return await Spa.findOne({ nom: name });
}

export async function getTagByName(name) {
	return await Tag.findOne({ nom: name });
}

export async function getPetByName(name) {
	return await Pet.findOne({ nom: name });
}

export async function compressImage(imagePath) {
	return await sharp(imagePath).resize(300).jpeg({ quality: 80 }).toBuffer();
}
