import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/user.js";
import Patient from "../models/patient.js";
import { connectDB } from "../db.js";
import dotenv from "dotenv";
dotenv.config();


const router = express.Router();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});


// ✅ Register patient
// router.post("/register", async (req, res) => {
//   try {
//     const { firstName, lastName, email, dateOfBirth, gender, phone, address } = req.body;

//     if (!firstName || !lastName || !email || !dateOfBirth || !gender || !phone) {
//       return res.status(400).json({ success: false, error: "All required fields are mandatory." });
//     }

//     await connectDB();

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, error: "Email already registered." });
//     }

//     const username =
//   new Date(dateOfBirth).toISOString().split("T")[0].replace(/-/g, "") +
//   Math.floor(1000 + Math.random() * 9000);

// const rawPassword = Math.floor(10000000 + Math.random() * 90000000).toString();
// const hashedPassword = await bcrypt.hash(rawPassword, 10);

// const user = new User({
//   email,
//   username,
//   password: hashedPassword,
//   role: "patient",
// });



//     await user.save();

//     const patient = new Patient({
//       user: user._id,
//       firstName,
//       lastName,
//       dateOfBirth,
//       gender,
//       phone,
//       address,
//       email,
//     });
//     await patient.save();

//     const mailOptions = {
//       from: `"Health Portal" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your Patient Login Details",
//       html: `
//         <h3>Welcome, ${firstName}!</h3>
//         <p>Your registration was successful. You can now log in using:</p>
//         <p><b>Email:</b> ${email}</p>
//         <p><b>Username:</b> ${username}</p>
//         <p><b>Password:</b> ${rawPassword}</p>
//         <p><a href="http://localhost:3001/login" target="_blank">Click here to login</a></p>
//         <br/>
//         <p>Thank you,<br/>Healthcare Team</p>
//       `,
//     };

//     try {
//   const info = await transporter.sendMail(mailOptions);
//   console.log("📧 Email sent successfully:", info.response);
// } catch (mailErr) {
//   console.error("⚠️ Email delivery failed:", mailErr);
// }


//     res.status(201).json({
//       success: true,
//       message: "Registration successful! Login details sent via email.",
//     });
//   } catch (error) {
//     console.error("❌ Registration Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
// ✅ Register patient (fixed version)
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, dateOfBirth, gender, phone, address } = req.body;

    if (!firstName || !lastName || !email || !dateOfBirth || !gender || !phone) {
      return res.status(400).json({ success: false, error: "All required fields are mandatory." });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered." });
    }

    // ✅ Generate username + password ONCE
    const username =
      new Date(dateOfBirth).toISOString().split("T")[0].replace(/-/g, "") +
      Math.floor(1000 + Math.random() * 9000);

    const rawPassword = Math.floor(10000000 + Math.random() * 90000000).toString();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    console.log("🧠 Generated password:", rawPassword);

    // ✅ Save user
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      role: "patient",
    });

    // ✅ Save patient
    await Patient.create({
      user: user._id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      email,
    });

    // ✅ Send email only after successful saves
    const mailOptions = {
      from: `"Health Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Patient Login Details",
      html: `
        <h3>Welcome, ${firstName}!</h3>
        <p>Your registration was successful. You can now log in using:</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Username:</b> ${username}</p>
        <p><b>Password:</b> ${rawPassword}</p>
        <p><a href="http://localhost:3001/login" target="_blank">Click here to login</a></p>
        <br/>
        <p>Thank you,<br/>Healthcare Team</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("📧 Email sent successfully:", info.response);
    } catch (mailErr) {
      console.error("⚠️ Email delivery failed:", mailErr);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Login details sent via email.",
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});





// ✅ Admin fetch all patients
router.get("/display", async (req, res) => {
  try {
    const patients = await Patient.find().populate("user", "email role");
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});


// routes/patient.js eth doctor patienta details kanan
router.get("/details/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("user", "email role");
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ✅ Get patient by linked userId eth doctor add akiya prescrption patientin kanan
router.get("/byUser/:userId", async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;

    // 🔍 find using the correct field "user"
    const patient = await Patient.findOne({ user: userId }).populate("user", "email role");

    if (!patient) {
      console.log("⚠️ No patient found for user:", userId);
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, patient });
  } catch (err) {
    console.error("❌ Error fetching patient:", err);
    res.status(500).json({ success: false, message: "Server Error: " + err.message });
  }
});


// ✅ Delete a patient
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by ID
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    // Delete linked user first (to avoid orphan data)
    await User.findByIdAndDelete(patient.user);

    // Delete patient record
    await Patient.findByIdAndDelete(id);

    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ✅ Update patient details
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, ...patientData } = req.body;

    await connectDB();

    // 1️⃣ Find the patient
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // 2️⃣ Update patient fields
    Object.assign(patient, patientData);
    if (email) patient.email = email;
    await patient.save();

    // 3️⃣ Update linked User (email + password)
    const user = await User.findById(patient.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "Linked user not found" });
    }

    if (email) user.email = email;
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile and login details updated successfully",
      patient,
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});







export default router;