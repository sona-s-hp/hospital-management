import mongoose from "mongoose";

const StockRequestSchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
  medicine: { type: String, required: true },
  requestedQty: { type: Number, required: true },
  status: { type: String, enum: ["requested", "approved", "rejected"], default: "requested" },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
  notes: { type: String },
});

export default mongoose.model("StockRequest", StockRequestSchema);
