import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  labName: String,
  email: { type: String, unique: true },
  contact: String,
  address: String,
  role: { type: String, default: "lab" },
}, { timestamps: true });

export default mongoose.model("Lab", labSchema);
