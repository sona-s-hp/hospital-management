import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import cookieParser from "cookie-parser";

const router = express.Router();

// Middleware to parse cookies
router.use(cookieParser());

// ----------------------
// ADMIN INITIALIZATION
// ----------------------
// router.get("/init-admin", async (req, res) => {
//   try {
//     const existingAdmin = await User.findOne({ role: "admin" });
//     if (existingAdmin) {
//       return res.status(200).json({ message: "Admin already exists" });
//     }

//     const admin = new User({
//       email: "sona@123",
//       password: "100",
//       role: "admin",
//     });
//     await admin.save();
//     res.status(201).json({
//       success: true,
//       message: "Admin user created successfully",
//       user: { email: admin.email, role: admin.role },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
router.get("/init-admin", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(200).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("100", 10); // 🔒 Hash before saving

    const admin = new User({
      email: "sona@123",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: { email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------
// LOGIN ROUTE
// ----------------------
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//    const user = await User.findOne({
//   $or: [{ email: req.body.email }, { username: req.body.email }]
// });

// if (!user) {
//   return res.status(400).json({ success: false, message: "User not found" });
// }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(401).json({ success: false, message: "Invalid password" });

//     // Create token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET || "secretkey",
//       { expiresIn: "1d" }
//     );

//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     // ✅ Send id back in response
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log("🧩 Incoming login request:", req.body);

//     const user = await User.findOne({
//       $or: [{ email: req.body.email }, { username: req.body.email }]
//     });

//     console.log("🔎 Found user:", user);

//     if (!user) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     console.log("✅ Password match:", validPassword);

//     if (!validPassword) {
//       return res.status(401).json({ success: false, message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET || "secretkey",
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });

//   } catch (err) {
//     console.error("💥 Login Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🧩 Incoming login request:", req.body);

    // Allow login with either email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    console.log("🔎 Found user:", user);

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log("✅ Password match:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    // ✅ Send all fields your frontend needs
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName || user.name?.split(" ")[0] || "User",
        lastName: user.lastName || user.name?.split(" ")[1] || "",
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("💥 Login Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});




// ----------------------
// LOGOUT ROUTE
// ----------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ----------------------
// GET CURRENT USER
// ----------------------
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
});



export default router;
