import bcrypt from "bcrypt";
import User from "../models/user.js";
import * as config from "../config.js";

export async function seedUsers() {
	const hashedPassword = await bcrypt.hash("password123", config.bcryptCostFactor);

	const userYverdon = new User({
		firstName: "Jane",
		lastName: "Doe",
		email: "jane.doe@example.com",
		password: hashedPassword,
	});
	const userZurich = new User({
		firstName: "Zoe",
		lastName: "Doe",
		email: "zoe.doe@example.com",
		password: hashedPassword,
	});
	const userMorges = new User({
		firstName: "Marc",
		lastName: "Doe",
		email: "marc.doe@example.com",
		password: hashedPassword,
	});
	const userclient = new User({
		firstName: "John",
		lastName: "Doe",
		email: "john.doe@example.com",
		password: hashedPassword,
	});
	const userclient2 = new User({
		firstName: "Elodie",
		lastName: "Perring",
		email: "elodie.perring@example.com",
		password: hashedPassword,
	});

	await userYverdon.save();
	await userZurich.save();
	await userMorges.save();
	await userclient.save();
	await userclient2.save();
}
