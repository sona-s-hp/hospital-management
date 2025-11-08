import express from "express";
import User from "../models/user.js";
import Pharmacy from "../models/pharmacy.js";

const router = express.Router();

// ➕ Add Pharmacy
router.post("/add", async (req, res) => {
  try {
    const { name, email, password, contact, hospital, licenseNumber } = req.body;

    // Validation
    if (!name || !email || !password || !contact || !licenseNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // ✅ Save plain password; user model will auto-hash it
    const user = new User({
      email,
      password,
      role: "pharmacy",
    });
    await user.save();

    // ✅ Create linked pharmacy record
    const pharmacy = new Pharmacy({
      name,
      contact,
      hospital,
      licenseNumber,
      email,
      userId: user._id,
    });
    await pharmacy.save();

    res.status(201).json({
      success: true,
      message: "Pharmacy added successfully",
      pharmacy,
    });
  } catch (err) {
    console.error("❌ Pharmacy Add Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📋 Get all pharmacies
router.get("/all", async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().populate("userId", "email role");
    res.status(200).json({ success: true, pharmacies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// 🗑️ Delete pharmacy and linked user
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: "Pharmacy not found" });
    }

    // Delete associated user
    await User.findByIdAndDelete(pharmacy.userId);

    // Delete pharmacy record
    await Pharmacy.findByIdAndDelete(id);

    res.json({ success: true, message: "Pharmacy deleted successfully" });
  } catch (err) {
    console.error("❌ Pharmacy Delete Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 👤 Get pharmacist by userId (for profile page)
router.get("/byUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const pharmacist = await Pharmacy.findOne({ userId });

    if (!pharmacist) {
      return res.status(404).json({ success: false, message: "Pharmacist not found" });
    }

    res.status(200).json({ success: true, pharmacist });
  } catch (err) {
    console.error("❌ Pharmacy Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ✏️ Update pharmacist
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, hospital, licenseNumber } = req.body;

    const pharmacist = await Pharmacy.findById(id);
    if (!pharmacist)
      return res.status(404).json({ success: false, message: "Pharmacist not found" });

    pharmacist.name = name || pharmacist.name;
    pharmacist.contact = contact || pharmacist.contact;
    pharmacist.hospital = hospital || pharmacist.hospital;
    pharmacist.licenseNumber = licenseNumber || pharmacist.licenseNumber;

    await pharmacist.save();

    res.json({ success: true, pharmacist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



export default router;
