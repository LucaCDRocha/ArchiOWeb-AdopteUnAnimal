import mongoose, { mongo } from 'mongoose';
const { Schema } = mongoose;

const tagSchema = new Schema({
    nom: String,
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;