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
  likes_count: { type: Number, default: 0 },
  dislikes_count: { type: Number, default: 0 },
  isAdopted: { type: Boolean, default: false },
});

const Pet = mongoose.model("Pet", petSchema);

export default Pet;