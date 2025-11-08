import mongoose from "mongoose";

const ProcedureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  notes: { type: String },
  performedAt: { type: Date, default: Date.now },
});

const VaccinationRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  vaccineType: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
  procedures: [ProcedureSchema], // ✅ Add procedures array
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.VaccinationRequest ||
  mongoose.model("VaccinationRequest", VaccinationRequestSchema);
