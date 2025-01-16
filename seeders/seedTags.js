import Tag from "../models/tag.js";

export async function seedTags() {
	const tagChien = new Tag({ nom: "Chien" });
	const tagChat = new Tag({ nom: "Chat" });
	const tagLapin = new Tag({ nom: "Lapin" });
	const tagJoueur = new Tag({ nom: "Joueur" });
	const tagTurbulant = new Tag({ nom: "Turbulant" });
	const tagCalme = new Tag({ nom: "Calme" });
	const tagCurieux = new Tag({ nom: "Curieux" });

	await tagChien.save();
	await tagChat.save();
	await tagLapin.save();
	await tagJoueur.save();
	await tagTurbulant.save();
	await tagCalme.save();
	await tagCurieux.save();
}
