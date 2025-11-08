// routes/emergencyLeave.js
import express from "express";
import EmergencyLeave from "../models/doctorleave.js"; // your model
import Doctor from "../models/doctor.js";

const router = express.Router();

// Create emergency leave
router.post("/apply", async (req, res) => {
  try {
    const { doctorId, reason, fromDate, toDate } = req.body;

    if (!doctorId) return res.status(400).json({ success: false, message: "Doctor ID missing" });

    const leave = new EmergencyLeave({
      doctor: doctorId, // foreign key
      reason,
      fromDate,
      toDate,
      status: "Pending",
    });

    await leave.save();
    res.json({ success: true, leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


router.get("/myLeaves/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) return res.status(400).json({ success: false, message: "Doctor ID missing" });

    const leaves = await EmergencyLeave.find({ doctor: doctorId }).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get all leaves (for admin)
router.get("/all", async (req, res) => {
  try {
    const leaves = await EmergencyLeave.find()
      .populate("doctor", "firstName lastName specialization department") // fetch doctor info
      .sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Approve or Reject leave
router.patch("/updateStatus/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // status = "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const leave = await EmergencyLeave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    );

    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    res.json({ success: true, leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
