'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Viewer } from "photo-sphere-viewer";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Scan, 
  FileText, 
  Clock,
  Send,
  Download,
  Eye,
  X,
  Plus,
  Minus,
  Heart, 
  Activity, 
  Thermometer, 
  Scale, 
  Droplets, 
  Brain, 
  AlertTriangle,
  TrendingUp,
  FileSearch,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");

  const [doctor, setDoctor] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("pharmacy");
  const [doctorNote, setDoctorNote] = useState<string>("");
  const [otherNote, setOtherNote] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNextVisit, setSelectedNextVisit] = useState<string>("");
  const [otherNextVisit, setOtherNextVisit] = useState<string>("");

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [radiologyImage, setRadiologyImage] = useState<string | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [vitalSigns, setVitalSigns] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  const specializationOptions: Record<string, any> = {
    "Orthopedic Surgeon": {
      pharmacy: ["Paracetamol", "Ibuprofen", "Diclofenac", "Calcium Supplements", "Vitamin D"],
      lab: ["Calcium Test", "Vitamin D Test", "CRP", "CBC"],
      radiology: ["X-Ray (Fracture Area)", "MRI (Joint)", "CT Scan (Bone)"],
    },
    Cardiologist: {
      pharmacy: ["Aspirin", "Atorvastatin", "Metoprolol", "Losartan", "Clopidogrel"],
      lab: ["Lipid Profile", "Troponin Test", "Blood Sugar", "Thyroid Profile"],
      radiology: ["ECG", "Echocardiogram", "CT Angiogram"],
    },
    Gynecologist: {
      pharmacy: ["Folic Acid", "Iron Supplements", "Progesterone", "Metformin", "Clomiphene"],
      lab: ["Pregnancy Test", "Thyroid Profile", "Hormone Panel", "Blood Sugar Test"],
      radiology: ["Pelvic Ultrasound", "Fetal Ultrasound", "Hysterosalpingogram"],
    },
    Neurologist: {
      pharmacy: ["Gabapentin", "Clonazepam", "Carbamazepine", "Amitriptyline", "Levetiracetam"],
      lab: ["EEG", "Vitamin B12", "Thyroid Profile", "Electrolyte Panel"],
      radiology: ["MRI Brain", "CT Head", "Nerve Conduction Study"],
    },
    Pediatrician: {
      pharmacy: ["Paracetamol Syrup", "Amoxicillin Suspension", "ORS", "Multivitamin Drops", "Zinc Syrup"],
      lab: ["CBC", "Urine Test", "Stool Test", "Blood Sugar"],
      radiology: ["Chest X-Ray", "Abdominal Ultrasound", "Head Ultrasound"],
    },
  };

  const defaultOptions = {
    pharmacy: ["Paracetamol", "Amoxicillin", "Ibuprofen"],
    lab: ["Blood Test", "Urine Test", "CBC"],
    radiology: ["X-Ray", "Ultrasound", "MRI"],
  };

  useEffect(() => {
    if (!patientId) return;

    const fetchAllData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const [doctorRes, patientRes, reportRes] = await Promise.all([
          fetch(`${API}/api/doctor/byUser/${user._id}`),
          fetch(`${API}/api/patient/details/${patientId}`),
          fetch(`${API}/api/prescription/patient/${patientId}`)
        ]);

        const [doctorData, patientData, reportData] = await Promise.all([
          doctorRes.json(),
          patientRes.json(),
          reportRes.json()
        ]);

        if (doctorData.success) setDoctor(doctorData.doctor);
        if (patientData.success) setPatient(patientData.patient);
        if (reportData.success) {
          setReports(reportData.prescriptions || []);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [patientId]);

  useEffect(() => {
    if (!doctor) return;
    const spec = doctor.specialization || "default";
    const specData = specializationOptions[spec] || defaultOptions;
    setAvailableOptions(specData[selectedAction]);
  }, [selectedAction, doctor]);

  // Fetch medical overview data
  useEffect(() => {
    if (patient) {
      fetchMedicalOverviewData(patient._id);
    }
  }, [patient]);

  const fetchMedicalOverviewData = async (patientId: string) => {
    try {
      // Mock data - replace with actual API calls
      setVitalSigns({
        bloodPressure: "120/80",
        heartRate: "72",
        temperature: "98.6°F",
        respiratoryRate: "16",
        oxygenSaturation: "98%",
        weight: "68 kg",
        height: "175 cm",
        bmi: "22.2",
        lastUpdated: new Date().toISOString()
      });

      setMedicalHistory([
        {
          id: 1,
          condition: "Hypertension",
          diagnosisDate: "2022-03-15",
          status: "Managed",
          severity: "Mild",
          notes: "Controlled with medication"
        },
        {
          id: 2,
          condition: "Type 2 Diabetes",
          diagnosisDate: "2021-08-20",
          status: "Managed",
          severity: "Moderate",
          notes: "Diet and exercise management"
        },
        {
          id: 3,
          condition: "Seasonal Allergies",
          diagnosisDate: "2020-05-10",
          status: "Active",
          severity: "Mild",
          notes: "Antihistamines as needed"
        }
      ]);

      setUpcomingAppointments([
        {
          id: 1,
          date: "2024-01-20",
          time: "10:00 AM",
          type: "Follow-up",
          doctor: "Dr. Smith",
          department: "Cardiology",
          reason: "Blood pressure check"
        },
        {
          id: 2,
          date: "2024-02-15",
          time: "2:30 PM",
          type: "Lab Test",
          doctor: "Lab Technician",
          department: "Pathology",
          reason: "Quarterly blood work"
        }
      ]);

      setHealthMetrics({
        bloodPressureTrend: "stable",
        bloodSugarTrend: "improving",
        cholesterolLevel: "normal",
        lastBloodTest: "2024-01-10",
        nextScreening: "2024-04-10",
        riskFactors: ["Family history of heart disease", "Sedentary lifestyle"],
        allergies: ["Penicillin", "Peanuts"],
        currentMedications: ["Lisinopril 10mg", "Metformin 500mg"]
      });

    } catch (error) {
      console.error("Error fetching medical overview data:", error);
    }
  };

  const handleSelectItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSend = async () => {
    if (!doctor?._id) return alert("⚠️ Doctor not found.");
    if (!patient?._id) return alert("⚠️ Patient not found.");

    const nextVisit =
      selectedNextVisit === "others" ? otherNextVisit.trim() : selectedNextVisit;

    let combinedNote = [doctorNote.trim(), otherNote.trim()].filter(Boolean).join("\n\n");
    if (!combinedNote && nextVisit) {
      combinedNote = `Next visit in ${nextVisit}`;
    }

    try {
      const res = await fetch(`${API}/api/prescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor._id,
          patientId: patient._id,
          medicines: selectedAction === "pharmacy" ? selectedItems.map((m) => m.name) : selectedItems,
          note: combinedNote,
          type: selectedAction,
          ...(selectedAction === "pharmacy" && { dispenseDetails: selectedItems }),
          nextVisit,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Successfully sent to ${selectedAction.toUpperCase()}`);
        setDoctorNote("");
        setOtherNote("");
        setSelectedItems([]);
        setSelectedNextVisit("");
        setOtherNextVisit("");
      } else {
        alert("❌ Failed to send. Try again.");
      }
    } catch (err) {
      console.error("Error sending prescription:", err);
    }
  };

  const handleViewReport = (report: any) => {
    if (!report.dispenseDetails || report.dispenseDetails.length === 0) {
      alert("No report available yet.");
      return;
    }

    if (report.type === "radiology" && report.image) {
      if (report.image.startsWith("data:image")) {
        setRadiologyImage(report.image);
      } else {
        setRadiologyImage(`${API}/uploads/radiology/${report.image}`);
      }
      setSelectedReport(report);
      return;
    }

    let tableHeaders = "";
    let tableRows = "";

    if (report.type === "lab") {
      tableHeaders = `<tr><th>Test</th><th>Result</th><th>Unit</th><th>Reference Range</th></tr>`;
      tableRows = report.dispenseDetails.map((d: any) =>
        `<tr><td>${d.name || "-"}</td><td>${d.result ?? "-"}</td><td>${d.unit ?? "-"}</td><td>${d.reference ?? "-"}</td></tr>`
      ).join("");
    } else if (report.type === "pharmacy") {
      tableHeaders = `<tr><th>Medicine</th><th>Timing</th><th>Before/After Food</th><th>Amount (₹)</th></tr>`;
      tableRows = report.dispenseDetails.map((m: any) => {
        const times = Object.keys(m.timing || {}).filter(t => m.timing[t]).join(", ");
        return `<tr><td>${m.name}</td><td>${times || "-"}</td><td>${m.food || "-"} food</td><td style="text-align:right;">₹${m.amount || 0}</td></tr>`;
      }).join("");
    }

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    reportWindow.document.write(`
      <html>
        <head>
          <title>${report.type.toUpperCase()} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #4b0082; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f8f4ff; color: #4b0082; font-weight: 600; }
            tr:nth-child(even) { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${report.type.toUpperCase()} REPORT</h1>
          <table>
            <thead>${tableHeaders}</thead>
            <tbody>
              ${tableRows}
              ${report.type === "pharmacy" ? `<tr style="background: #f0f7ff;"><td colspan="3" style="font-weight: bold;">Total Amount</td><td style="font-weight: bold; text-align:right;">₹${report.totalAmount || 0}</td></tr>` : ""}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.print();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    if (radiologyImage) {
      viewerRef.current = new Viewer({
        panorama: radiologyImage,
        container: containerRef.current,
        loadingImg: "/spinner.gif",
        navbar: ["zoom", "fullscreen", "autorotate", "move"],
        defaultLat: 0,
        defaultLong: 0,
        mousewheel: true,
        touchmoveTwoFingers: true,
      });
    }
  }, [radiologyImage]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Medical Overview Components
  const VitalSignsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Vital Signs
        </h3>
        <span className="text-sm text-gray-500">
          Last updated: {vitalSigns ? new Date(vitalSigns.lastUpdated).toLocaleDateString() : 'N/A'}
        </span>
      </div>
      
      {vitalSigns ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Heart Rate</p>
            <p className="text-xl font-bold text-gray-900">{vitalSigns.heartRate} BPM</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Blood Pressure</p>
            <p className="text-xl font-bold text-gray-900">{vitalSigns.bloodPressure}</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="text-xl font-bold text-gray-900">{vitalSigns.temperature}</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Scale className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">BMI</p>
            <p className="text-xl font-bold text-gray-900">{vitalSigns.bmi}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No vital signs recorded yet</p>
        </div>
      )}
    </motion.div>
  );

  const MedicalHistoryCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <FileSearch className="w-5 h-5 text-blue-600" />
        Medical History
      </h3>
      
      {medicalHistory.length > 0 ? (
        <div className="space-y-4">
          {medicalHistory.map((condition, index) => (
            <motion.div
              key={condition.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{condition.condition}</h4>
                  <p className="text-sm text-gray-600">
                    Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{condition.notes}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    condition.status === 'Managed' ? 'bg-green-100 text-green-800' :
                    condition.status === 'Active' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {condition.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    condition.severity === 'Mild' ? 'bg-blue-100 text-blue-800' :
                    condition.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {condition.severity}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No medical history recorded</p>
        </div>
      )}
    </motion.div>
  );

  const UpcomingAppointmentsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        Upcoming Appointments
      </h3>
      
      {upcomingAppointments.length > 0 ? (
        <div className="space-y-4">
          {upcomingAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{appointment.type}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                  <p className="text-sm text-gray-600">With {appointment.doctor}</p>
                  <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {appointment.department}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming appointments</p>
        </div>
      )}
    </motion.div>
  );

  const HealthMetricsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        Health Metrics & Alerts
      </h3>
      
      {healthMetrics ? (
        <div className="space-y-6">
          {/* Current Medications */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-purple-600" />
              Current Medications
            </h4>
            <div className="flex flex-wrap gap-2">
              {healthMetrics.currentMedications.map((med: string, index: number) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {med}
                </span>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Allergies
            </h4>
            <div className="flex flex-wrap gap-2">
              {healthMetrics.allergies.map((allergy: string, index: number) => (
                <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Risk Factors
            </h4>
            <ul className="space-y-2">
              {healthMetrics.riskFactors.map((risk: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* Screening Schedule */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Blood Test</p>
              <p className="font-semibold text-gray-900">
                {new Date(healthMetrics.lastBloodTest).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Next Screening</p>
              <p className="font-semibold text-blue-600">
                {new Date(healthMetrics.nextScreening).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No health metrics available</p>
        </div>
      )}
    </motion.div>
  );

  const QuickActionsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-600" />
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab("prescriptions")}
          className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center group"
        >
          <Pill className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-blue-700">New Prescription</p>
        </button>
        
        <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center group">
          <FileSearch className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-green-700">Add Vitals</p>
        </button>
        
        <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center group">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-purple-700">Schedule Visit</p>
        </button>
        
        <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center group">
          <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-orange-700">Add Note</p>
        </button>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading patient details...</p>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
        <p className="text-gray-600 mb-4">The requested patient record could not be found.</p>
        <button 
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-lg p-3 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                Patient Medical Record
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive patient management and medical history
              </p>
            </div>
          </div>

          {doctor && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-600">Attending Physician</p>
              <p className="font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              <p className="text-sm text-blue-600">{doctor.specialization}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Patient Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {getInitials(patient.firstName, patient.lastName)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <p className="text-blue-100">
                    {patient.gender} • {calculateAge(patient.dateOfBirth)} years • Patient ID: #{patient._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm">Last Visit</p>
                <p className="font-semibold">
                  {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "First Visit"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{patient.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{patient.address || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Medical Overview", icon: Stethoscope },
              { id: "reports", label: "Reports & History", icon: FileText },
              { id: "prescriptions", label: "New Prescription", icon: Pill },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Medical Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <QuickActionsCard />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vital Signs */}
                <VitalSignsCard />
                
                {/* Upcoming Appointments */}
                <UpcomingAppointmentsCard />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medical History */}
                <MedicalHistoryCard />
                
                {/* Health Metrics */}
                <HealthMetricsCard />
              </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Medical Reports & History
                </h3>
                <div className="text-sm text-gray-500">
                  {reports.length} record{reports.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reports Available</h4>
                  <p className="text-gray-600">No medical reports have been generated for this patient yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            report.type === 'pharmacy' ? 'bg-green-100 text-green-600' :
                            report.type === 'lab' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {report.type === 'pharmacy' ? <Pill className="w-5 h-5" /> :
                             report.type === 'lab' ? <FlaskConical className="w-5 h-5" /> :
                             <Scan className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize">{report.type} Report</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(report.createdAt).toLocaleDateString()} • 
                              Dr. {report.doctorId?.firstName} {report.doctorId?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === "Dispensed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {report.status === "Dispensed" ? "Completed" : "Pending"}
                          </span>
                          {report.status === "Dispensed" && (
                            <button
                              onClick={() => handleViewReport(report)}
                              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Report</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Action Type Selection */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  New Medical Order
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { id: "pharmacy", label: "Pharmacy", icon: Pill, color: "from-green-500 to-emerald-500" },
                    { id: "lab", label: "Lab Tests", icon: FlaskConical, color: "from-blue-500 to-cyan-500" },
                    { id: "radiology", label: "Radiology", icon: Scan, color: "from-purple-500 to-indigo-500" },
                  ].map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedAction(action.id)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedAction === action.id
                            ? `border-transparent bg-gradient-to-r ${action.color} text-white shadow-lg`
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <IconComponent className="w-8 h-8 mb-3" />
                        <h4 className="font-semibold text-lg">{action.label}</h4>
                        <p className="text-sm opacity-90 mt-1">
                          {action.id === "pharmacy" ? "Prescribe medications" :
                           action.id === "lab" ? "Order laboratory tests" :
                           "Schedule imaging studies"}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Items Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    {selectedAction === "pharmacy" ? "💊 Select Medications" :
                     selectedAction === "lab" ? "🧪 Select Lab Tests" :
                     "🩻 Select Radiology Scans"}
                  </label>

                  {selectedAction === "pharmacy" ? (
                    <div className="space-y-3">
                      {availableOptions.map((medicine) => {
                        const medData = selectedItems.find((m: any) => m.name === medicine);
                        return (
                          <motion.div
                            key={medicine}
                            layout
                            className={`border rounded-xl p-4 transition-all ${
                              medData ? "bg-green-50 border-green-200 shadow-sm" : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-900 cursor-pointer flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!medData}
                                  onChange={() => {
                                    setSelectedItems((prev: any) => {
                                      if (medData) {
                                        return prev.filter((m: any) => m.name !== medicine);
                                      }
                                      return [
                                        ...prev,
                                        {
                                          name: medicine,
                                          timing: { morning: false, afternoon: false, evening: false },
                                          food: "after",
                                          amount: 0,
                                        },
                                      ];
                                    });
                                  }}
                                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                {medicine}
                              </label>
                              {medData && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                  Selected
                                </span>
                              )}
                            </div>

                            {medData && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pl-7 border-t pt-4 border-green-200 space-y-4"
                              >
                                <div>
                                  <label className="block font-medium text-gray-700 mb-2">⏰ Dosage Timing</label>
                                  <div className="flex gap-4">
                                    {["morning", "afternoon", "evening"].map((time) => (
                                      <label key={time} className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={medData.timing[time]}
                                          onChange={() => {
                                            setSelectedItems((prev: any) =>
                                              prev.map((m: any) =>
                                                m.name === medicine
                                                  ? {
                                                      ...m,
                                                      timing: {
                                                        ...m.timing,
                                                        [time]: !m.timing[time],
                                                      },
                                                    }
                                                  : m
                                              )
                                            );
                                          }}
                                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="capitalize text-gray-700">{time}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block font-medium text-gray-700 mb-2">🍽 Administration</label>
                                  <select
                                    value={medData.food}
                                    onChange={(e) => {
                                      setSelectedItems((prev: any) =>
                                        prev.map((m: any) =>
                                          m.name === medicine
                                            ? { ...m, food: e.target.value }
                                            : m
                                        )
                                      );
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="before">Before Food</option>
                                    <option value="after">After Food</option>
                                    <option value="with">With Food</option>
                                  </select>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {availableOptions.map((item) => (
                        <motion.button
                          key={item}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectItem(item)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedItems.includes(item)
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      Doctor's Notes
                    </label>
                    <textarea
                      value={doctorNote}
                      onChange={(e) => setDoctorNote(e.target.value)}
                      className="w-full h-32 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter diagnosis, treatment plan, and medical notes..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      Additional Instructions
                    </label>
                    <textarea
                      value={otherNote}
                      onChange={(e) => setOtherNote(e.target.value)}
                      className="w-full h-32 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Any special instructions or follow-up notes..."
                    />
                  </div>
                </div>

                {/* Next Visit */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <label className="block font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Schedule Next Visit
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["1 day", "3 days", "1 week", "2 weeks", "1 month"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-500 transition-colors bg-white"
                      >
                        <input
                          type="radio"
                          name="nextVisit"
                          value={option}
                          checked={selectedNextVisit === option}
                          onChange={() => setSelectedNextVisit(option)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium">{option}</span>
                      </label>
                    ))}

                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 bg-white">
                      <input
                        type="radio"
                        name="nextVisit"
                        value="others"
                        checked={selectedNextVisit === "others"}
                        onChange={() => setSelectedNextVisit("others")}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium mr-2">Custom:</span>
                      <input
                        type="text"
                        placeholder="e.g., 6 weeks"
                        value={otherNextVisit}
                        onChange={(e) => setOtherNextVisit(e.target.value)}
                        disabled={selectedNextVisit !== "others"}
                        className="border-b border-gray-400 focus:outline-none focus:border-blue-500 w-24 bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Send to {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Radiology Modal */}
      <AnimatePresence>
        {selectedReport && radiologyImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Scan className="w-6 h-6 text-purple-600" />
                  Radiology Report Viewer
                </h2>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setRadiologyImage(null);
                    if (viewerRef.current) viewerRef.current.destroy();
                    viewerRef.current = null;
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <div ref={containerRef} style={{ width: '100%', height: '60vh' }} className="rounded-lg overflow-hidden" />
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setRadiologyImage(null);
                    if (viewerRef.current) viewerRef.current.destroy();
                    viewerRef.current = null;
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}