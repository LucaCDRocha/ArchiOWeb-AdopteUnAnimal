import mongoose from "mongoose";
const { Schema } = mongoose;

const petSchema = new Schema({
  nom: String,
  description: String,
  images: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  spa_id: { type: mongoose.Types.ObjectId, ref: "Spa" },
  likes_count: Number,
  dislikes_count: Number,
});

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
