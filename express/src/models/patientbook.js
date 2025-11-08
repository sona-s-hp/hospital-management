import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor", // 👈 must match the model name in your doctor.js file
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient", // 👈 match the model name in your patient.js file
    required: true,
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
});

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
