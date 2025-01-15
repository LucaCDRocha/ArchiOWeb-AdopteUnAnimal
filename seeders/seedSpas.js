import Spa from "../models/spa.js";
import { getUserByEmail } from "./utils.js";

export async function seedSpas() {
	const userYverdon = await getUserByEmail("jane.doe@example.com");
	const userZurich = await getUserByEmail("zoe.doe@example.com");
	const userMorges = await getUserByEmail("marc.doe@example.com");

	const spaYverdon = new Spa({
		nom: "SPA de Yverdon",
		adresse: "Yverdon",
		latitude: 46.46514,
		longitude: 6.38484,
		user_id: userYverdon._id,
	});
	const spaMorges = new Spa({
		nom: "SPA de Morges",
		adresse: "Morges",
		latitude: 46.30233,
		longitude: 6.29471,
		user_id: userMorges._id,
	});
	const spaZurich = new Spa({
		nom: "SPA de Zurich",
		adresse: "Zurich",
		latitude: 47.22334,
		longitude: 8.32388,
		user_id: userZurich._id,
	});

	await spaYverdon.save();
	await spaMorges.save();
	await spaZurich.save();
}
