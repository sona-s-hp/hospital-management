import mongoose from "mongoose";

const EmergencyLeaveSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: { type: String, default: "Pending" },
}, { timestamps: true });

export default mongoose.model("EmergencyLeave", EmergencyLeaveSchema);
