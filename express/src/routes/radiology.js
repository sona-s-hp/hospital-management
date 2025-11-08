// routes/radiology.js
import express from "express";
import Radiology from "../models/radiology.js";
import Prescription from "../models/prescription.js";

const router = express.Router();


// ✅ Register new radiology center
// ✅ Register new radiology center (linked to userId)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, contact, hospital, licenseNumber, userId } = req.body;

    // Check if already exists
    const existing = await Radiology.findOne({ email });
    if (existing) {
      return res.json({ success: false, error: "Radiology with this email already exists" });
    }

    // ✅ Create radiology with linked userId
    const newRadiology = new Radiology({
      name,
      email,
      password,
      contact,
      hospital,
      licenseNumber,
      userId, // 👈 this is the fix
    });

    await newRadiology.save();

    res.json({ success: true, message: "Radiology Center Registered", radiology: newRadiology });
  } catch (err) {
    console.error("Error registering radiology:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});



// ✅ Display all radiology centers
router.get("/display", async (req, res) => {
  try {
    const radiologyCenters = await Radiology.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json({ success: true, radiologyCenters });
  } catch (err) {
    console.error("Error fetching radiology centers:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});


// ✅ Get all imaging requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await Prescription.find({ type: "radiology" })
      .populate("patientId", "firstName lastName email phone gender")
      .populate("doctorId", "firstName lastName specialization")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Fetch Imaging Requests Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});


// ✅ Get radiologist by ID
// ✅ Get radiologist by linked userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const radiologist = await Radiology.findOne({ userId }).lean();

    if (!radiologist) {
      console.log("❌ Radiologist not found for userId:", userId);
      return res.status(404).json({ success: false, message: "Radiologist not found" });
    }

    console.log("✅ Found radiologist:", radiologist);
    res.status(200).json({ success: true, radiologist });
  } catch (err) {
    console.error("Error in /user/:userId:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});




// ✅ Update radiologist
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, hospital, licenseNumber } = req.body;

    const radiologist = await Radiology.findById(id);
    if (!radiologist)
      return res.status(404).json({ success: false, message: "Radiologist not found" });

    radiologist.name = name || radiologist.name;
    radiologist.contact = contact || radiologist.contact;
    radiologist.hospital = hospital || radiologist.hospital;
    radiologist.licenseNumber = licenseNumber || radiologist.licenseNumber;

    await radiologist.save();
    res.json({ success: true, radiologist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// ✅ Delete a radiology center
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Radiology.findByIdAndDelete(id);

    if (!deleted) {
      return res.json({ success: false, error: "Radiology center not found" });
    }

    res.json({ success: true, message: "Radiology Center deleted successfully" });
  } catch (err) {
    console.error("Error deleting radiology:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});



export default router;
