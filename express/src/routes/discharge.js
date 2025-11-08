import express from "express";
import Discharge from "../models/discharge.js";
import Prescription from "../models/prescription.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";

const router = express.Router();

// ✅ Create a new discharge summary
router.post("/create", async (req, res) => {
  try {
    const discharge = new Discharge(req.body);
    await discharge.save();
    res.json({ success: true, message: "Discharge Summary Saved", discharge });
  } catch (err) {
    console.error("Error saving discharge:", err);
    res.status(500).json({ success: false, message: "Error saving discharge" });
  }
});

// ✅ Get all discharge summaries
router.get("/all", async (req, res) => {
  try {
    const summaries = await Discharge.find()
      .populate("patientId", "firstName lastName email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, summaries });
  } catch (err) {
    console.error("Error fetching discharges:", err);
    res.status(500).json({ success: false, message: "Error fetching summaries" });
  }
});

// ✅ Get one discharge with reports + doctor info (for staff/discharge/[id])
router.get("/:id", async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id)
      .populate("patientId", "firstName lastName email phone");
    if (!discharge)
      return res.status(404).json({ success: false, message: "Discharge not found" });

    // 🧠 Fetch reports (lab/pharmacy/radiology) for this patient
    const prescriptions = await Prescription.find({ patientId: discharge.patientId })
      .populate("doctorId", "firstName lastName department");

    // Group by type for frontend
    const labReports = prescriptions.filter((r) => r.type === "lab");
    const pharmacyReports = prescriptions.filter((r) => r.type === "pharmacy");
    const radiologyReports = prescriptions.filter((r) => r.type === "radiology");

    // Fetch doctor info
    const doctor = await Doctor.findOne({ firstName: discharge.doctorName.split(" ")[0] });

    res.json({
      success: true,
      discharge,
      reports: { labReports, pharmacyReports, radiologyReports },
      doctor,
    });
  } catch (err) {
    console.error("Error fetching discharge details:", err);
    res.status(500).json({ success: false, message: "Error fetching discharge details" });
  }
});

// ✅ Request payment
router.patch("/requestPayment/:id", async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id);
    if (!discharge)
      return res.status(404).json({ success: false, message: "Discharge not found" });

    discharge.paymentRequested = true;
    discharge.paymentStatus = "Pending";
    await discharge.save();

    res.json({ success: true, message: "Payment requested", discharge });
  } catch (err) {
    console.error("Error requesting payment:", err);
    res.status(500).json({ success: false, message: "Error requesting payment" });
  }
});

// ✅ Mark payment as paid
router.patch("/markPaid/:id", async (req, res) => {
  try {
    const discharge = await Discharge.findById(req.params.id);
    if (!discharge)
      return res.status(404).json({ success: false, message: "Discharge not found" });

    discharge.paymentStatus = "Paid";
    await discharge.save();

    res.json({ success: true, message: "Payment marked as paid", discharge });
  } catch (err) {
    console.error("Error marking as paid:", err);
    res.status(500).json({ success: false, message: "Error updating payment status" });
  }
});

export default router;
