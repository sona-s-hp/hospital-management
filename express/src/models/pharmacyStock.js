import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, default: 0 },
});

// one PharmacyStock per pharmacy
const PharmacyStockSchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true, unique: true },
  medicines: [MedicineSchema],
  updatedAt: { type: Date, default: Date.now },
});

PharmacyStockSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("PharmacyStock", PharmacyStockSchema);
