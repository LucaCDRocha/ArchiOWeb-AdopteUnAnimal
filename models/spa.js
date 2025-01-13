import mongoose from "mongoose";
const { Schema } = mongoose;

const spaSchema = new Schema({
	nom: { type: String, required: true },
	adresse: { type: String, unique: true, required: true },
	latitude: { type: String, required: true },
	longitude: { type: String, required: true },
	user_id: { type: mongoose.Types.ObjectId, ref: "User" },
});

const Spa = mongoose.model("Spa", spaSchema);

export default Spa;
