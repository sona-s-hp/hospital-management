import mongoose from "mongoose";

const TeleconsultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    mode: { type: String, enum: ["Video", "Audio"], default: "Video" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed", "Cancelled"],
      default: "Pending",
    },

    // ✅ NEW FIELD — unique meeting link for doctor & patient
    meetingLink: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Teleconsultation ||
  mongoose.model("Teleconsultation", TeleconsultationSchema);
