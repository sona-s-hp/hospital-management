import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import Staff from "../models/staff.js";

const router = express.Router();

// ✅ Add Staff
router.post("/add", async (req, res) => {
  try {
    const { firstName, lastName, email, password, contact, department, hospital } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Create User (with hashed password automatically in schema)
    const newUser = new User({
      username: email.split("@")[0],
      email,
      password,
      role: "staff",
    });
    await newUser.save();

    // Create Staff profile linked to User
    const newStaff = new Staff({
      userId: newUser._id,
      firstName,
      lastName,
      contact,
      department,
      hospital,
    });
    await newStaff.save();

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      staff: newStaff,
    });
  } catch (err) {
    console.error("Error adding staff:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get All Staff (populate user details)
router.get("/all", async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate("userId", "email role isActive") // join with User
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete Staff (and linked user)
router.delete("/delete/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    await User.findByIdAndDelete(staff.userId); // delete user login too
    await Staff.findByIdAndDelete(req.params.id); // delete staff profile

    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// ✅ Get logged-in staff details
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // Find staff linked to this user
    const staff = await Staff.findOne({ userId: decoded.id })
      .populate("userId", "email role");

    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, staff });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token", error: err.message });
  }
});


// ✅ Get staff by userId
router.get("/byUser/:userId", async (req, res) => {
  try {
    const staff = await Staff.findOne({ userId: req.params.userId });
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff not found" });
    res.status(200).json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


export default router;
