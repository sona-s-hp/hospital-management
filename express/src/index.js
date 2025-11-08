import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from "./routes/doctor.js";
import labRoutes from "./routes/lab.js";
import patientRoutes from "./routes/patient.js";
import pharmacyRoutes from "./routes/pharmacy.js";
import radiologyRoutes from "./routes/radiology.js";
import patientbookRoutes from "./routes/patientbook.js";
import prescriptionRoutes from "./routes/prescription.js";
import doctorLeaveRoutes from "./routes/doctorleave.js";
import pharmacystockRoute from "./routes/pharmacystock.js";
import vacinationRoute from "./routes/vacination.js";
import dischargeRoutes from "./routes/discharge.js";
import auditRouter from "./routes/adminanaly.js";
import teleconsultationRouter from "./routes/teleconsultation.js";
import staffRouter from "./routes/staff.js";
import adminStockRoute from "./routes/adminStock.js";
// import zegoTokenRoute from "./routes/zegoToken.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// ✅ Connect route
app.use('/api/auth', authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/patient",patientRoutes);
app.use("/api/pharmacy",pharmacyRoutes);
app.use("/api/radiology",radiologyRoutes);
app.use("/api/appointment",patientbookRoutes);
app.use("/api/prescription",prescriptionRoutes);
app.use("/api/emergencyLeave",doctorLeaveRoutes);
app.use("/api/pharmacy",pharmacystockRoute);
app.use("/api/vaccination",vacinationRoute);
app.use("/api/discharge", dischargeRoutes);
app.use("/api/admin/",auditRouter);
app.use("/api/teleconsultation",teleconsultationRouter);
app.use("/api/staff",staffRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/admins", adminStockRoute);
// app.use("/api/zego", zegoTokenRoute);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
