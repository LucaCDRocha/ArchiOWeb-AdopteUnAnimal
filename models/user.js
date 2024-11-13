import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	password: String,
	likes: [{ type: mongoose.Types.ObjectId, ref: "Pet" }],
	dislikes: [{ type: mongoose.Types.ObjectId, ref: "Pet" }],
	adoptions: [{ type: mongoose.Types.ObjectId, ref: "Adoption" }],
});

const User = mongoose.model("User", userSchema);

export default User;
