import express from "express";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";
import Appointment from "../models/patientbook.js"; // ✅ add this
import { connectDB } from "../db.js"; // ✅ add this


const router = express.Router();

// Admin adds doctor
router.post("/add", async (req, res) => {
  try {
    const { firstName, lastName, email, password, specialization, department, contact, hospital } = req.body;

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

    // ✅ Create login entry for doctor (no manual hashing)
    const user = new User({
      email,
      password, // plain text here, Mongoose will hash automatically
      role: "doctor"
    });
    await user.save();

    // ✅ Create doctor profile
    const doctor = new Doctor({
      userId: user._id,
      firstName,
      lastName,
      email,
      specialization,
      department,
      contact,
      hospital
    });
    await doctor.save();

    res.status(201).json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all doctors
router.get("/all", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "email role");
    res.status(200).json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Get doctor by userId
router.get("/byUser/:userId", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.status(200).json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});




// ✅ Get all patients who booked appointments with a specific doctor
// ✅ Get all patients who booked appointments with a specific doctor
import mongoose from "mongoose";

router.get("/patients/:doctorId", async (req, res) => {
  try {
    await connectDB();
    const { doctorId } = req.params;

    console.log("🩺 Doctor ID received:", doctorId);

    // Convert doctorId to ObjectId to ensure proper matching
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const appointments = await Appointment.find({ doctorId: doctorObjectId })
      .populate({
        path: "patientId",
        model: "Patient",
        select: "firstName lastName email phone",
      });

    console.log("📋 Found appointments:", appointments);

    const validPatients = appointments
      .filter((appt) => appt.patientId)
      .map((appt) => appt.patientId);

    const uniquePatients = [
      ...new Map(validPatients.map((p) => [p._id.toString(), p])).values(),
    ];

    res.set("Cache-Control", "no-store");

    res.json({ success: true, patients: uniquePatients });
  } catch (error) {
    console.error("❌ Error fetching doctor's patients:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});



// ✅ Delete doctor by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Delete linked user login
    await User.findByIdAndDelete(doctor.userId);

    // Delete the doctor profile
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting doctor:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ✅ Update doctor profile
router.put("/update/:id", async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const {
      firstName,
      lastName,
      contact,
      specialization,
      department,
      email,
    } = req.body;

    // 🔍 Check if doctor exists
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // 🧠 Update doctor fields
    doctor.firstName = firstName || doctor.firstName;
    doctor.lastName = lastName || doctor.lastName;
    doctor.contact = contact || doctor.contact;
    doctor.specialization = specialization || doctor.specialization;
    doctor.department = department || doctor.department;

    await doctor.save();

    // 📨 Also update email if provided (in linked User model)
    if (email) {
      await User.findByIdAndUpdate(doctor.user, { email });
    }

    res.json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Doctor Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
});







export default router;
