import express from "express";
import mongoose from "mongoose"; // ✅ must import
import Appointment from "../models/patientbook.js";
import Patient from "../models/patient.js";
import { connectDB } from "../db.js";

const router = express.Router();

// ✅ Create appointment
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const { doctorId, patientId, date, time } = req.body;

    if (!doctorId || !patientId || !date || !time) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // 🧠 patientId may be a User ID, not Patient ID — fix that:
    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient profile not found" });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Check if slot already booked
    const exists = await Appointment.findOne({
      doctorId,
      date: formattedDate,
      time,
    });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked" });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      date: formattedDate,
      time,
    });

    res.json({ success: true, appointment });
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ✅ Get booked slots for a doctor + date
router.get("/", async (req, res) => {
  try {
    await connectDB();
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID and Date required" });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];

    const appointments = await Appointment.find({
      doctorId,
      date: formattedDate,
    });

    const bookedSlots = appointments.map((a) => a.time);

    res.json({ success: true, bookedSlots });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


// GET appointments for patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    await connectDB();
    const { patientId } = req.params;

    const appointments = await Appointment.find({
      patientId: new mongoose.Types.ObjectId(patientId),
    })
      .populate("doctorId", "firstName lastName specialization department")
      .populate("patientId", "firstName lastName email phone");

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("❌ Error fetching patient appointments:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ✅ Get appointments for specific doctor and patient
router.get("/doctor/:doctorId/patient/:patientId", async (req, res) => {
  try {
    await connectDB();
    const { doctorId, patientId } = req.params;

    const appointments = await Appointment.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: new mongoose.Types.ObjectId(patientId),
    })
      .populate("patientId", "firstName lastName email phone")
      .populate("doctorId", "firstName lastName department");

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("❌ Error fetching doctor-patient appointments:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ✅ Cancel an appointment
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("❌ Error cancelling appointment:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
