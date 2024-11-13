import mongoose, { mongo } from 'mongoose';
const { Schema } = mongoose;

const spaSchema = new Schema({
    nom: String,
    place: String,
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' }
});

const Spa = mongoose.model('Spa', spaSchema);

export default Spa;