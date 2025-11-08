import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: String,
  contact: String,
  hospital: String,
  licenseNumber: { type: String, unique: true },
  email: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Pharmacy", pharmacySchema);
