import mongoose from "mongoose";
const { Schema } = mongoose;

const petSchema = new Schema({
  nom: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String, required: true },
  images: [
    {
      data: Buffer,
      imgType: String,
    },
  ],
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  spa_id: { type: mongoose.Types.ObjectId, ref: "Spa" },
  likes_count: Number,
  dislikes_count: Number,
  isAdopted: { type: Boolean, default: false },
});

const Pet = mongoose.model("Pet", petSchema);

export default Pet;