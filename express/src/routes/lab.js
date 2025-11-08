import express from "express";
import Lab from "../models/lab.js";
import User from "../models/user.js";

const router = express.Router();

// Add lab
router.post("/add", async (req, res) => {
  try {
    const { labName, email, password, contact, address } = req.body;

    // Required fields
    if (!labName || !email || !password) {
      return res.status(400).json({ success: false, message: "Lab Name, Email, and Password are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // ✅ Don't hash manually (your model does it automatically)
    const user = new User({
      email,
      password,
      role: "lab",
    });
    await user.save();

    // ✅ Create Lab record
    const lab = new Lab({
      userId: user._id,
      labName,
      email,
      contact,
      address,
    });
    await lab.save();

    res.status(201).json({
      success: true,
      message: "Lab added successfully",
      lab,
    });
  } catch (err) {
    console.error("Lab Add Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all labs
router.get("/all", async (req, res) => {
  try {
    const labs = await Lab.find().populate("userId", "email role");
    res.status(200).json({ success: true, labs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const lab = await Lab.findById(id);
    if (!lab) return res.status(404).json({ success: false, message: "Lab not found" });

    // Delete linked user
    await User.findByIdAndDelete(lab.userId);

    // Delete lab record
    await Lab.findByIdAndDelete(id);

    res.json({ success: true, message: "Lab deleted successfully" });
  } catch (err) {
    console.error("Lab Delete Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ✅ Get Lab by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const lab = await Lab.findOne({ userId });
    if (!lab) return res.status(404).json({ success: false, message: "Lab not found" });
    res.json({ success: true, lab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update Lab profile
router.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const lab = await Lab.findOneAndUpdate({ userId }, req.body, { new: true });
    if (!lab) return res.status(404).json({ success: false, message: "Lab not found" });
    res.json({ success: true, lab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
