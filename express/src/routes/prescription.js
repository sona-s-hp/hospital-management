import express from "express";
import { connectDB } from "../db.js";
import Prescription from "../models/prescription.js";

const router = express.Router();

/* ========================================================
   ✅ 1. Get ALL prescriptions (for admin/pharmacy overview)
======================================================== */
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const prescriptions = await Prescription.find()
      .populate("doctorId", "firstName lastName department specialization")
      .populate("patientId", "firstName lastName gender phone");

    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/* ========================================================
   ✅ 2. Get prescriptions by patient ID
======================================================== */
// router.get("/patient/:id", async (req, res) => {
//   try {
//     await connectDB();
//     const prescriptions = await Prescription.find({ patientId: req.params.id })
//       .populate("doctorId", "firstName lastName specialization")
//       .populate("patientId", "firstName lastName email phone")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, prescriptions });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// ✅ Get all prescriptions for a specific patient
router.get("/patient/:id", async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    // Find all prescriptions linked to this patient
    const prescriptions = await Prescription.find({ patientId: id })
      .populate("doctorId", "firstName lastName department")
      .populate("patientId", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    if (!prescriptions || prescriptions.length === 0) {
      return res.json({
        success: true,
        prescriptions: [],
        message: "No prescriptions found for this patient",
      });
    }

    res.json({ success: true, prescriptions });
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});




/* ========================================================
   ✅ 3. Create new prescription (Doctor adds)
======================================================== */
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const { doctorId, patientId, medicines, note, type, dispenseDetails } = req.body;

    const newPrescription = await Prescription.create({
      doctorId,
      patientId,
      medicines,
      note,
      type: type || "pharmacy",
      dispenseDetails: dispenseDetails || [], // ✅ doctor can send structured details
      status: "Pending",
    });

    res.json({ success: true, prescription: newPrescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/* ========================================================
   ✅ 4. Update prescription (lab/pharmacy/radiology adds results)
======================================================== */
router.put("/dispense/:id", async (req, res) => {
  try {
    await connectDB();
    const { dispenseDetails, totalAmount, image } = req.body;

    if (!dispenseDetails || dispenseDetails.length === 0) {
      return res.status(400).json({ success: false, message: "Dispense details required" });
    }

    const updated = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: "Dispensed",
        dispenseDetails,
        totalAmount: totalAmount || 0,
        image: image || null,
        dispensedAt: new Date(),
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Prescription not found" });

    res.json({ success: true, prescription: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



/* ========================================================
   ✅ 5. Get all LAB requests
======================================================== */
router.get("/lab", async (req, res) => {
  try {
    await connectDB();
    const labRequests = await Prescription.find({ type: "lab" })
      .populate("doctorId", "firstName lastName specialization")
      .populate("patientId", "firstName lastName email phone gender");

    res.json({ success: true, labRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   ✅ 6. Get single prescription by ID
======================================================== */
router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctorId", "firstName lastName email department")
      .populate("patientId", "firstName lastName email phone gender");

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    res.json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
