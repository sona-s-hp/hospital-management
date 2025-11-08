// routes/adminAnalytics.js
import express from "express";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";
import Lab from "../models/lab.js";
import Pharmacy from "../models/pharmacy.js";
import Radiology from "../models/radiology.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalLabs = await Lab.countDocuments();
    const totalPharmacy = await Pharmacy.countDocuments();
    const totalRadiology = await Radiology.countDocuments();

    res.json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalLabs,
        totalPharmacy,
        totalRadiology,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
});

export default router;
