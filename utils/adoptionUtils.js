
import Adoption from "../models/adoption.js";

export async function addMessageToAdoption(adoptionId, message) {
	return Adoption.findById(adoptionId)
		.populate({
			path: "pet_id",
			populate: [
				{
					path: "spa_id",
					model: "Spa"
				}
			]
		})
		.exec()
		.then((adoption) => {
			if (!adoption) {
				throw new Error("Adoption not found");
			}
			adoption.messages.push(message);
			return adoption.save().then((updatedAdoption) => {
				const userIds = [adoption.user_id.toString(), adoption.pet_id.spa_id.user_id.toString()];
				return { messages: updatedAdoption.messages, userIds };
			});
		});
}