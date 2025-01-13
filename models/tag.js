import mongoose from "mongoose";
const { Schema } = mongoose;

const tagSchema = new Schema({
	nom: { type: String, unique: true, required: true }
});

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
