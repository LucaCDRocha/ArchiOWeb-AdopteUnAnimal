import User from "../models/user.js";
import Spa from "../models/spa.js";

export async function loadUserByRequestId(req, res, next) {
	const user = await User.findById(req.params.id);
	if (user === null) {
		return res.status(404).send({ message: "User not found" });
	}

	req.user = user;
	next();
}

export async function checkSpaLink(req, res, next) {
	try {
		const spa = await Spa.findOne({ user_id: req.currentUserId }).exec();
		if (!spa) {
			return res.status(403).send({ message: "You are not allowed to add pets" });
		}
		req.spa = spa;
		next();
	} catch (err) {
		next(err);
	}
}
