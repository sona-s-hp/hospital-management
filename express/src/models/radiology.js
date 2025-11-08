
import mongoose from "mongoose";

const RadiologySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  hospital: { type: String },
  licenseNumber: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export default mongoose.models.Radiology || mongoose.model("Radiology", RadiologySchema);
