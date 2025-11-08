import express from "express";
import mongoose from "mongoose";
import VaccinationRequest from "../models/vaccination.js";

const router = express.Router();

// ✅ Create vaccination request (Patient booking)
router.post("/request", async (req, res) => {
  try {
    const { patientId, doctorId, vaccineType, date, time } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId))
      return res.status(400).json({ success: false, message: "Invalid patient ID" });

    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });

    if (!vaccineType || !date || !time)
      return res.status(400).json({ success: false, message: "All fields required" });

    const request = new VaccinationRequest({
      patient: patientId,
      doctor: doctorId,
      vaccineType,
      date,
      time,
    });

    await request.save();

    const populatedRequest = await VaccinationRequest.findById(request._id)
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName specialization department");

    res.json({ success: true, request: populatedRequest });
  } catch (err) {
    console.error("Error creating vaccination request:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get all vaccination requests (Admin)
router.get("/all", async (req, res) => {
  try {
    const requests = await VaccinationRequest.find()
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName specialization department")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get doctor’s vaccination appointments
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });

    const requests = await VaccinationRequest.find({ doctor: doctorId })
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName specialization department")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get patient’s vaccination bookings
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId))
      return res.status(400).json({ success: false, message: "Invalid patient ID" });

    const requests = await VaccinationRequest.find({ patient: patientId })
      .populate("doctor", "firstName lastName specialization department")
      .populate("patient", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Add procedure to a vaccination request (Doctor)
// Add procedure(s) to a vaccination request (Doctor)
router.post("/addProcedure/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { procedures } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid request ID" });
    }

    if (!procedures || !Array.isArray(procedures) || procedures.length === 0) {
      return res.status(400).json({ success: false, message: "No procedures provided" });
    }

    const request = await VaccinationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Push each procedure to the request
    procedures.forEach(p => {
      if (!p.name) throw new Error("Procedure name is required");
      request.procedures.push({
        name: p.name,
        performedAt: p.performedAt || new Date(),
      });
    });

    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    console.error("❌ Error adding procedure:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// ✅ Update vaccination request status
router.put("/updateStatus/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId))
      return res.status(400).json({ success: false, message: "Invalid request ID" });

    const request = await VaccinationRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    )
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName specialization department");

    if (!request)
      return res.status(404).json({ success: false, message: "Request not found" });

    res.json({ success: true, request });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all vaccination requests for a patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId))
      return res.status(400).json({ success: false, message: "Invalid patient ID" });

    const requests = await VaccinationRequest.find({ patient: patientId })
      .populate("doctor", "firstName lastName specialization department email")
      .populate("patient", "firstName lastName")
      .sort({ date: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("❌ Error fetching patient requests:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



export default router;
