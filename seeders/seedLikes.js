import { getUserByEmail, getPetByName } from "./utils.js";

export async function seedLikes() {
	const userclient = await getUserByEmail("john.doe@example.com");
	const userclient2 = await getUserByEmail("elodie.perring@example.com");

	const chienArthur = await getPetByName("Arthur");
	const chienCookie = await getPetByName("Cookie");

	userclient.likes.push(chienArthur._id, chienCookie._id);
	userclient2.likes.push(chienArthur._id);

	chienArthur.likes_count = 2;
	chienCookie.likes_count = 1;

	await userclient.save();
	await userclient2.save();

	await chienArthur.save();
	await chienCookie.save();
}
