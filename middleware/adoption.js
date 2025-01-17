import Adoption from "../models/adoption.js";

// Middleware to load adoption by request ID
export async function loadAdoptionByRequestId(req, res, next) {
	try {
		const adoption = await Adoption.findById(req.params.id)
			.populate("user_id")
			.populate({
				path: "pet_id",
				populate: [
					{
						path: "spa_id",
						model: "Spa",
					},
				],
			})
			.exec();
		if (!adoption) {
			return res.status(404).send({ message: "Adoption not found" });
		}
		req.adoption = adoption;
		next();
	} catch (err) {
		next(err);
	}
}
