// models/AuditLog.ts
import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  user: String,           // Admin username/email
  action: String,         // e.g., "Requested Payment"
  target: String,         // e.g., patient/discharge ID
  details: String,        // Extra info
  date: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", AuditLogSchema);
