import mongoose from "mongoose";

// ✅ Common structure for pharmacy, lab, and radiology results
const dispenseDetailSchema = new mongoose.Schema({
  // 🩺 Common field (medicine/test/scan name)
  name: { type: String, required: true },

  // 💊 Pharmacy-specific fields
  timing: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
  },
  food: { type: String, enum: ["before", "after"], default: "after" },

  // ✅ Add these two fields
  slipCount: { type: Number, default: 0 },
  amountPerSlip: { type: Number, default: 0 },

  // Still keep your old amount field (for total or fallback)
  amount: { type: Number },

  // 🧪 Lab fields
  result: { type: String },
  unit: { type: String },
  reference: { type: String },

  // 🩻 Radiology fields
  findings: { type: String },
  remarks: { type: String },
});


const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    medicines: [{ type: String }],
    note: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Dispensed"],
      default: "Pending",
    },
    dispenseDetails: [dispenseDetailSchema],
    totalAmount: { type: Number },
    dispensedAt: { type: Date },

    // ✅ Identify which department (pharmacy, lab, or radiology)
    type: {
      type: String,
      enum: ["pharmacy", "lab", "radiology"],
      default: "pharmacy",
    },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
