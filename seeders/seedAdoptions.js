import Adoption from "../models/adoption.js";
import { getUserByEmail, getPetByName } from "./utils.js";

export async function seedAdoptions() {
	const userclient = await getUserByEmail("john.doe@example.com");
	const userclient2 = await getUserByEmail("elodie.perring@example.com");
	const userYverdon = await getUserByEmail("jane.doe@example.com");

	const chienArthur = await getPetByName("Arthur");
	const chienCookie = await getPetByName("Cookie");

	const adoption = new Adoption({
		date: new Date(),
		user_id: userclient._id,
		pet_id: chienArthur._id,
		messages: [
			{
				content: "Je suis intéressé par l'adoption de ce chien.",
				date: new Date(),
				user_id: userclient._id,
			},
			{
				content: "Merci pour votre intérêt. Nous allons examiner votre demande.",
				date: new Date(),
				user_id: userYverdon._id,
			},
		],
	});
	const adoption2 = new Adoption({
		date: new Date(),
		user_id: userclient2._id,
		pet_id: chienArthur._id,
		messages: [
			{
				content: "Je suis intéressé par l'adoption de ce chien.",
				date: new Date(),
				user_id: userclient2._id,
			},
			{
				content: "Merci pour votre intérêt. Nous allons examiner votre demande.",
				date: new Date(),
				user_id: userYverdon._id,
			},
		],
	});
	const conversation2 = new Adoption({
		date: new Date(),
		user_id: userclient._id,
		pet_id: chienCookie._id,
		messages: [
			{
				content: "Bonjour, ce chiot est adorable, j'aimerais l'adopter.",
				date: new Date(),
				user_id: userclient._id,
			},
			{
				content: "Bonjour, merci pour votre intérêt. Nous allons examiner votre demande.",
				date: new Date(),
				user_id: userYverdon._id,
			},
			{
				content: "D'accord, savez-vous combien de temps ça prendra ?",
				date: new Date(),
				user_id: userclient._id,
			},
			{
				content: "Nous vous répondrons dans les plus brefs délais, d'ici 1 à 2 jours.",
				date: new Date(),
				user_id: userYverdon._id,
			},
		],
	});

	await adoption.save();
	await adoption2.save();
	await conversation2.save();
}
