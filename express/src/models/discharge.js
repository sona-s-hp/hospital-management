import mongoose from "mongoose";

const dischargeSchema = new mongoose.Schema(
  {
    hospital: String,
    doctorName: String,
    specialization: String,

    patientName: String,
    patientEmail: String,
    patientPhone: String,
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },

    date: String,

    reports: {
      pharmacyReports: { type: Array, default: [] },
      labReports: { type: Array, default: [] },
      radiologyReports: { type: Array, default: [] },
    },

    billing: {
      pharmacyTotal: { type: Number, default: 0 },
      labTotal: { type: Number, default: 0 },
      radiologyTotal: { type: Number, default: 0 },
      serviceCharge: { type: Number, default: 0 },
      consultationFee: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },

    paymentRequested: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "None"],
      default: "None",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discharge", dischargeSchema);
