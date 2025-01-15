import Spa from "../models/spa.js";

export async function loadSpaByRequestId(req, res, next) {
	try {
		const spa = await Spa.findById(req.params.id).exec();
		if (!spa) {
			return res.status(404).send({ message: "Spa not found" });
		}
		req.spa = spa;
		next();
	} catch (err) {
		next(err);
	}
}
