// import express from "express";
// import dotenv from "dotenv";
// import { ZegoServerAssistant } from "zego-server-assistant-nodejs";

// dotenv.config();
// const router = express.Router();

// router.post("/token", async (req, res) => {
//   try {
//     const { userID, roomID, userName } = req.body;

//     if (!userID || !roomID || !userName) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     const appID = Number(process.env.ZEGO_APP_ID);
//     const serverSecret = process.env.ZEGO_SERVER_SECRET;

//     const effectiveTimeInSeconds = 3600; // 1 hour
//     const payload = ""; // optional

//     const token = ZegoServerAssistant.generateToken04(
//       appID,
//       userID,
//       serverSecret,
//       effectiveTimeInSeconds,
//       payload
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     console.error("Error generating token:", err);
//     res.status(500).json({ success: false, message: "Token generation failed" });
//   }
// });

// export default router;
