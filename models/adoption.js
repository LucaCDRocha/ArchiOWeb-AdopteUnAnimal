import mongoose from "mongoose";
const { Schema } = mongoose;

const adoptionSchema = new Schema({
	date: Date,
	user_id: { type: mongoose.Types.ObjectId, ref: "User" },
	pet_id: { type: mongoose.Types.ObjectId, ref: "Pet" },
	status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
	messages: [
		{
			_id: { type: mongoose.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
			content: String,
			date: Date,
			user_id: { type: mongoose.Types.ObjectId, ref: "User" },
		},
	],
});

adoptionSchema.index({ user_id: 1, pet_id: 1 }, { unique: true });

const Adoption = mongoose.model("Adoption", adoptionSchema);

export default Adoption;
