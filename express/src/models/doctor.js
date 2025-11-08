import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  specialization: String,
  department: String,
  contact: String,
  hospital: String,
  role: { type: String, default: "doctor" },
}, { timestamps: true });

export default mongoose.model("Doctor", doctorSchema);
