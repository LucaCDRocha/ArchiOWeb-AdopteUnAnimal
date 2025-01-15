import Pet from "../models/pet.js";
import { compressImage } from "./utils.js";
import { getTagByName, getSpaByName } from "./utils.js";

export async function seedPets() {
	const spaYverdon = await getSpaByName("SPA de Yverdon");
	const spaMorges = await getSpaByName("SPA de Morges");
	const spaZurich = await getSpaByName("SPA de Zurich");

	const tagChien = await getTagByName("Chien");
	const tagChat = await getTagByName("Chat");
	const tagLapin = await getTagByName("Lapin");
	const tagJoueur = await getTagByName("Joueur");
	const tagTurbulant = await getTagByName("Turbulant");
	const tagCalme = await getTagByName("Calme");
	const tagCurieux = await getTagByName("Curieux");

	const imageMorges = await compressImage("Images/spaMorges_chien.jpg");
	const imageParis = await compressImage("Images/spaYverdon_chien.jpg");
	const imageZurich = await compressImage("Images/spaZurich_chien.jpg");
	const imageChatKira = await compressImage("Images/chatKira.jpg");
	const imageChatGouttiere = await compressImage("Images/chat-de-gouttiere.jpg");
	const imageChaton = await compressImage("Images/chaton.jpg");
	const imageLapin = await compressImage("Images/lapin.jpg");
	const imageLapinou = await compressImage("Images/lapinou.jpeg");

	const chienToffee = new Pet({
		nom: "Toffee",
		age: 12,
		description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
		images: [
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageMorges, imgType: "image/jpeg" },
			{ data: imageZurich, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaYverdon._id,
	});
	const chienCara = new Pet({
		nom: "Cara",
		age: 12,
		description: "Un chien très mignon qui a 12 ans bientôt 13 ans",
		images: [
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageMorges, imgType: "image/jpeg" },
			{ data: imageZurich, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaYverdon._id,
	});
	const chienBeth = new Pet({
		nom: "Bethany",
		age: 10,
		description: "Un chien très mignon qui a 10 ans. Très calme et affectueuse, adore jouer avec les enfants",
		images: [
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageMorges, imgType: "image/jpeg" },
			{ data: imageZurich, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaYverdon._id,
	});
	const chienArthur = new Pet({
		nom: "Arthur",
		age: 3,
		description: "Un chien très mignon qui a 3ans. Border Collie croisé avec golden retriever",
		images: [
			{ data: imageMorges, imgType: "image/jpeg" },
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageZurich, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaYverdon._id,
	});
	const chienMerlan = new Pet({
		nom: "Merlan",
		age: 3,
		description: "Un chien très mignon qui a 3ans. Border Collie croisé avec golden retriever",
		images: [
			{ data: imageMorges, imgType: "image/jpeg" },
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageZurich, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaMorges._id,
	});
	const chienCookie = new Pet({
		nom: "Cookie",
		age: 1,
		description: "Un chiot de tout juste une année qui veut être aimée et être caressée.",
		images: [
			{ data: imageMorges, imgType: "image/jpeg" },
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageZurich, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaYverdon._id,
	});
	const chienBat = new Pet({
		nom: "Bat",
		age: 3,
		description: "Un chiot de tout juste 3 ans qui veut être aimée et être caressée.",
		images: [
			{ data: imageZurich, imgType: "image/jpeg" },
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageMorges, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaZurich._id,
	});
	const chienJoie = new Pet({
		nom: "Joie",
		age: 1,
		description: "Un chiot de tout juste une année qui veut être aimée et être caressée.",
		images: [
			{ data: imageZurich, imgType: "image/jpeg" },
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageMorges, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaZurich._id,
	});
	const chienCaline = new Pet({
		nom: "Caline",
		age: 1,
		description:
			"Caline est un chiot d'un ans qui adore les câlins et les balades. Elle est très affectueuse et aime jouer avec les enfants.",
		images: [
			{ data: imageZurich, imgType: "image/jpeg" },
			{ data: imageParis, imgType: "image/jpeg" },
			{ data: imageMorges, imgType: "image/jpeg" },
		],
		tags: [tagChien._id, tagJoueur._id],
		spa_id: spaZurich._id,
	});
	const chatKira = new Pet({
		nom: "Kira",
		age: 3,
		description: "Une chatte toute mignonne qui a 2 ans. Elle est très calme et adore les câlins.",
		images: [
			{ data: imageChatKira, imgType: "image/jpeg" },
			{ data: imageChatGouttiere, imgType: "image/jpeg" },
			{ data: imageChaton, imgType: "image/jpeg" },
		],
		tags: [tagChat._id, tagCalme._id],
		spa_id: spaYverdon._id,
	});
	const chatPito = new Pet({
		nom: "Pito",
		age: 8,
		description: "Un chat très mignon qui a 8 ans. Il est très joueur et curieux.",
		images: [
			{ data: imageChatGouttiere, imgType: "image/jpeg" },
			{ data: imageChatGouttiere, imgType: "image/jpeg" },
			{ data: imageChaton, imgType: "image/jpeg" },
		],
		tags: [tagChat._id, tagJoueur._id, tagCurieux._id, tagTurbulant._id],
		spa_id: spaMorges._id,
	});
	const chatMojito = new Pet({
		nom: "Mojito",
		age: 1,
		description: "Un chaton de tout juste une année qui veut être aimée et être caressée.",
		images: [
			{ data: imageChaton, imgType: "image/jpeg" },
			{ data: imageChatGouttiere, imgType: "image/jpeg" },
			{ data: imageChatKira, imgType: "image/jpeg" },
		],
		tags: [tagChat._id, tagCalme],
		spa_id: spaMorges._id,
	});
	const lapinJojo = new Pet({
		nom: "Jojo",
		age: 2,
		description: "Un lapin très mignon qui a 2 ans. Il est très joueur et curieux.",
		images: [
			{ data: imageLapin, imgType: "image/jpeg" },
			{ data: imageLapinou, imgType: "image/jpeg" },
		],
		tags: [tagLapin._id, tagTurbulant, tagCurieux._id],
		spa_id: spaYverdon._id,
	});
	const lapinRoger = new Pet({
		nom: "Roger",
		age: 1,
		description: "Un lapin très mignon qui a 1 ans. Il est très joueur et curieux.",
		images: [
			{ data: imageLapinou, imgType: "image/jpeg" },
			{ data: imageLapin, imgType: "image/jpeg" },
		],
		tags: [tagLapin._id, tagJoueur, tagCurieux._id],
		spa_id: spaZurich._id,
	});

	await chienToffee.save();
	await chienCara.save();
	await chienBeth.save();
	await chienArthur.save();
	await chienMerlan.save();
	await chienCookie.save();
	await chienBat.save();
	await chienJoie.save();
	await chienCaline.save();
	await chatKira.save();
	await chatPito.save();
	await chatMojito.save();
	await lapinJojo.save();
	await lapinRoger.save();
}
