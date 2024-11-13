import mongoose from 'mongoose';
const { Schema } = mongoose;

const utilisateurSchema = new Schema({
  nom: String,
  prenom: String,
  email: String
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

export default Utilisateur;