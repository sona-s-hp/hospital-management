import express from "express";
import Teleconsultation from "../models/teleconsultaion.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// ✅ CREATE teleconsultation
router.post("/request", async (req, res) => {
  try {
    const { patientId, doctorId, date, time, mode } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🧩 Generate a unique meeting ID for this consultation
    const meetingId = uuidv4();

    // 🧠 Generate links for both Doctor and Patient
    const baseLink = `/telecall/${meetingId}`;
    const meetingLinkPatient = `${baseLink}?role=Patient`;
    const meetingLinkDoctor = `${baseLink}?role=Doctor`;

    // ✅ Store the base meeting link (without role)
    const newRequest = await Teleconsultation.create({
      patientId,
      doctor: doctorId,
      date,
      time,
      mode,
      status: "Pending",
      meetingLink: baseLink,
    });

    const populatedRequest = await newRequest.populate(
      "doctor",
      "firstName lastName specialization department"
    );

    // ✅ Return both links in response (useful for frontend)
    res.json({
      success: true,
      request: populatedRequest,
      meetingLinks: {
        doctor: meetingLinkDoctor,
        patient: meetingLinkPatient,
      },
    });
  } catch (err) {
    console.error("Error creating teleconsultation:", err);
    res.status(500).json({
      success: false,
      message: "Server error while booking consultation",
    });
  }
});

// ✅ GET teleconsultations by patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const requests = await Teleconsultation.find({ patientId })
      .populate("doctor", "firstName lastName specialization department")
      .lean();

    // 🧠 Append role-based meeting link for patient
    const updatedRequests = requests.map((r) => ({
      ...r,
      meetingLink: `${r.meetingLink}?role=Patient`,
    }));

    res.json({ success: true, requests: updatedRequests });
  } catch (err) {
    console.error("Error fetching teleconsultations:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teleconsultations",
    });
  }
});

// ✅ GET teleconsultations by doctor
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const requests = await Teleconsultation.find({ doctor: doctorId })
      .populate("patientId", "firstName lastName")
      .lean();

    // 🧠 Append role-based meeting link for doctor
    const updatedRequests = requests.map((r) => ({
      ...r,
      meetingLink: `${r.meetingLink}?role=Doctor`,
    }));

    res.json({ success: true, requests: updatedRequests });
  } catch (err) {
    console.error("Error fetching doctor teleconsultations:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teleconsultations",
    });
  }
});


// ✅ UPDATE teleconsultation status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Teleconsultation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Consultation not found" });

    res.json({ success: true, consultation: updated });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




export default router;
