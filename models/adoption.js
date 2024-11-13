import mongoose from 'mongoose';
const { Schema } = mongoose;

const adoptionSchema = new Schema({
    date: Date,
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    pet_id: { type: mongoose.Types.ObjectId, ref: 'Pet' },
    messages: [
        {
            _id: mongoose.Types.ObjectId,
            content: String,
            date: Date,
            user_id: { type: mongoose.Types.ObjectId, ref: 'User' }
        }
    ]
});

const Adoption = mongoose.model('Adoption', adoptionSchema);


export default Adoption;