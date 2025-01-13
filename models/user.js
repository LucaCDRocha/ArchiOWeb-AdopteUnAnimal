import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	likes: [{ type: mongoose.Types.ObjectId, ref: "Pet" }],
	dislikes: [{ type: mongoose.Types.ObjectId, ref: "Pet" }],
});

userSchema.set("toJSON", {
	transform: transformJsonUser,
});

function transformJsonUser(doc, json, options) {
	// Remove the hashed password from the generated JSON.
	delete json.password;
	// Remove optimistic locking version field from the generated JSON.
	delete json.__v;
	return json;
}

const User = mongoose.model("User", userSchema);

export default User;
