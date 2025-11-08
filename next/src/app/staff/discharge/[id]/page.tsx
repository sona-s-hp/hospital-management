'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Viewer } from "photo-sphere-viewer";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText, 
  Pill, 
  Microscope, 
  Stethoscope,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle
} from "lucide-react";

function ReportCard({ report, onView }: { report: any; onView: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dispensed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pharmacy": return <Pill size={20} />;
      case "lab": return <Microscope size={20} />;
      case "radiology": return <Stethoscope size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getTypeIcon(report.type)}
          <span className="font-semibold text-gray-800 capitalize">{report.type} Report</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} />
          <span>{report.doctorId?.firstName} {report.doctorId?.lastName}</span>
        </div>
      </div>

      {report.status === "Dispensed" && (
        <button
          onClick={onView}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={16} />
          View Report
        </button>
      )}
    </div>
  );
}

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [radiologyImage, setRadiologyImage] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewerRef = useRef<Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  useEffect(() => {
    if (!patientId) return;

    const fetchAllData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user._id) {
          alert("⚠️ No logged-in user found");
          setLoading(false);
          return;
        }

        let profileUrl = "";
        if (user.role === "doctor") {
          profileUrl = `${API}/api/doctor/byUser/${user._id}`;
        } else if (user.role === "staff") {
          profileUrl = `${API}/api/staff/byUser/${user._id}`;
        }

        const [profileRes, patientRes, reportRes] = await Promise.all([
          fetch(profileUrl),
          fetch(`${API}/api/patient/details/${patientId}`),
          fetch(`${API}/api/prescription/patient/${patientId}`),
        ]);

        const [profileData, patientData, reportData] = await Promise.all([
          profileRes.json(),
          patientRes.json(),
          reportRes.json(),
        ]);

        if (profileData.success) setDoctor(profileData.doctor || profileData.staff);
        if (patientData.success) setPatient(patientData.patient);
        if (reportData.success) setReports(reportData.prescriptions || []);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [patientId]);

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
        navbar: ["zoom", "fullscreen", "autorotate", "move"],
      });
    }
  }, [radiologyImage]);

  const handleViewReport = (report: any) => {
    if (!report) return alert("⚠️ No report found.");

    if (report.type === "radiology" && report.image) {
      const imgUrl = report.image.startsWith("data:")
        ? report.image
        : `${API}/uploads/radiology/${report.image}`;
      setRadiologyImage(imgUrl);
      setSelectedReport(report);
      return;
    }

    if (report.type === "lab" && report.dispenseDetails?.length) {
      const reportWindow = window.open("", "_blank");
      if (!reportWindow) return;
      
      let rows = report.dispenseDetails.map((t: any) => `
        <tr>
          <td>${t.name || "-"}</td>
          <td>${t.result || "-"}</td>
          <td>${t.unit || "-"}</td>
          <td>${t.reference || "-"}</td>
        </tr>
      `).join("");
      
      reportWindow.document.write(`
        <html>
          <head>
            <title>Lab Report - ${patient.firstName} ${patient.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1f2937; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f3f4f6; }
              tr:nth-child(even) { background-color: #f9fafb; }
            </style>
          </head>
          <body>
            <h1>🧪 Lab Report</h1>
            <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
            <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `);
      reportWindow.document.close();
      return;
    }

    if (report.type === "pharmacy" && report.dispenseDetails?.length) {
      const reportWindow = window.open("", "_blank");
      if (!reportWindow) return;
      
      let rows = report.dispenseDetails.map((m: any) => `
        <tr>
          <td>${m.name}</td>
          <td>${Object.keys(m.timing || {}).filter(t => m.timing[t]).join(", ")}</td>
          <td>${m.food || "-"} food</td>
          <td>₹${m.amount || 0}</td>
        </tr>
      `).join("");

      reportWindow.document.write(`
        <html>
          <head>
            <title>Pharmacy Bill - ${patient.firstName} ${patient.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1f2937; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f3f4f6; }
              .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>💊 Pharmacy Bill</h1>
            <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
            <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Timing</th>
                  <th>Food Relation</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="total">Total: ₹${report.totalAmount || 0}</div>
          </body>
        </html>
      `);
      reportWindow.document.close();
      return;
    }

    alert("⚠️ No valid report details found.");
  };

  const handleGenerateSummary = async () => {
    if (!doctor || !patient) {
      setError("⚠️ Missing staff/doctor or patient details");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Filter completed reports
      const pharmacyReports = reports.filter(r => r.type === "pharmacy" && r.status === "Dispensed");
      const labReports = reports.filter(r => r.type === "lab" && r.status === "Dispensed");
      const radiologyReports = reports.filter(r => r.type === "radiology" && r.status === "Dispensed");

      // Calculate totals
      const pharmacyTotal = pharmacyReports.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      const labTotal = labReports.length * 500; // Example fixed cost per lab test
      const radiologyTotal = radiologyReports.length * 1000; // Example fixed cost per radiology test
      const serviceCharge = 250;
      const consultationFee = doctor.consultationFee || 300;
      const totalAmount = pharmacyTotal + labTotal + radiologyTotal + serviceCharge + consultationFee;

      // Create discharge summary object
      const dischargeSummary = {
        hospital: doctor.hospital || "HealthPlus Multicare Hospital",
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization || doctor.department || "General",
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        patientId: patient._id,
        doctorId: doctor._id,
        date: new Date().toISOString(),
        reports: {
          pharmacyReports,
          labReports,
          radiologyReports
        },
        billing: {
          pharmacyTotal,
          labTotal,
          radiologyTotal,
          serviceCharge,
          consultationFee,
          totalAmount
        },
        status: "completed"
      };

      // Save to database
      const res = await fetch(`${API}/api/discharge/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(dischargeSummary),
      });

      const data = await res.json();

      if (data.success) {
        setSummary(dischargeSummary);
        // Show success message
        setTimeout(() => {
          alert("✅ Discharge Summary Generated and Saved Successfully!");
        }, 100);
      } else {
        throw new Error(data.message || "Failed to save discharge summary");
      }
    } catch (err: any) {
      console.error("Error generating summary:", err);
      setError(err.message || "Failed to generate discharge summary");
      
      // Fallback: Create local summary even if API fails
      const fallbackSummary = {
        hospital: "HealthPlus Multicare Hospital",
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization || doctor.department || "General",
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        date: new Date().toLocaleDateString(),
        billing: {
          pharmacyTotal: 0,
          labTotal: 0,
          radiologyTotal: 0,
          serviceCharge: 250,
          consultationFee: 300,
          totalAmount: 550
        },
        status: "local"
      };
      setSummary(fallbackSummary);
      alert("⚠️ Summary generated locally (API call failed)");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewSummary = () => {
    if (!summary) {
      setError("⚠️ No discharge summary generated yet!");
      return;
    }

    const { hospital, doctorName, specialization, patientName, patientEmail, patientPhone, date, billing } = summary;

    const popup = window.open("", "_blank", "width=800,height=600");
    if (!popup) {
      setError("Please allow popups to view the summary");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Discharge Summary - ${patientName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 30px; 
              line-height: 1.6; 
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              border-radius: 15px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 700px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 { 
              color: #4b0082; 
              margin: 0;
              font-size: 2.2em;
            }
            h2 { 
              color: #4b0082; 
              margin-top: 30px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 10px;
            }
            .hospital-info {
              color: #666;
              font-size: 1.1em;
              margin: 10px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #e0e0e0; 
              padding: 15px; 
              text-align: left; 
            }
            th { 
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              font-weight: 600;
            }
            tr:nth-child(even) { 
              background-color: #f8f9fa; 
            }
            .total-row {
              background: #e8f5e8 !important;
              font-weight: bold;
              font-size: 1.1em;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #666;
              font-style: italic;
              border-top: 2px solid #f0f0f0;
              padding-top: 20px;
            }
            .signature {
              margin-top: 50px;
              text-align: right;
            }
            .doctor-info {
              border-top: 1px solid #ccc;
              display: inline-block;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 ${hospital}</h1>
              <div class="hospital-info">Discharge Summary</div>
              <p><strong>Date:</strong> ${date}</p>
            </div>
            
            <h2>Medical Professional</h2>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Specialization:</strong> ${specialization}</p>
            
            <h2>Patient Details</h2>
            <p><strong>Name:</strong> ${patientName}</p>
            <p><strong>Email:</strong> ${patientEmail}</p>
            <p><strong>Phone:</strong> ${patientPhone}</p>
            
            <h2>Billing Summary</h2>
            <table>
              <tr>
                <th>Category</th>
                <th>Amount (₹)</th>
              </tr>
              <tr>
                <td>Pharmacy</td>
                <td>${billing.pharmacyTotal}</td>
              </tr>
              <tr>
                <td>Lab Tests</td>
                <td>${billing.labTotal}</td>
              </tr>
              <tr>
                <td>Radiology</td>
                <td>${billing.radiologyTotal}</td>
              </tr>
              <tr>
                <td>Service Charge</td>
                <td>${billing.serviceCharge}</td>
              </tr>
              <tr>
                <td>Consultation Fee</td>
                <td>${billing.consultationFee}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Total Amount</strong></td>
                <td><strong>₹${billing.totalAmount}</strong></td>
              </tr>
            </table>

            <div class="signature">
              <div class="doctor-info">
                <p><strong>Dr. ${doctorName.split(' ')[0]}</strong></p>
                <p>${specialization}</p>
                <p>${hospital}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing ${hospital}. Wishing you a speedy recovery!</p>
              <p>For any queries, please contact: +91-XXXXXX-XXXX</p>
            </div>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading patient details...</p>
        </div>
      </div>
    );

  if (!patient)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-4">The requested patient record could not be loaded.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Patient Details</h1>
                <p className="text-gray-600">Comprehensive patient information and management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer size={16} />
                Print
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200">
            {["overview", "reports", "history", "billing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-gray-600">Patient ID: {patient._id?.slice(-8)}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <User size={18} />
                  <span>{patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} />
                  <span>{patient.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={18} />
                  <span>{patient.address || "No address provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} />
                  <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Medical Summary</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Active Reports:</span>
                    <span className="font-semibold">{reports.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Reports:</span>
                    <span className="font-semibold">
                      {reports.filter(r => r.status === "Dispensed").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold text-green-600">Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reports Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Medical Reports</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {reports.length} reports
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No medical reports available for this patient.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((report, index) => (
                    <ReportCard
                      key={index}
                      report={report}
                      onView={() => handleViewReport(report)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Discharge Summary Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">🏥 Discharge Summary</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">Generate Discharge Summary</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Create a comprehensive discharge summary including all medical reports, 
                  billing information, and follow-up instructions.
                </p>
                
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={generating}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl transition-colors font-medium flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText size={18} />
                        Generate Summary
                      </>
                    )}
                  </button>

                  {summary && (
                    <button
                      onClick={handleViewSummary}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors font-medium flex items-center gap-2"
                    >
                      <Download size={18} />
                      View Summary
                    </button>
                  )}
                </div>
              </div>

              {summary && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-medium">Discharge summary generated successfully</span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Summary created on {new Date().toLocaleDateString()} by {doctor?.firstName} {doctor?.lastName}
                  </p>
                  {summary.status === "local" && (
                    <p className="text-orange-600 text-sm mt-1">
                      Note: Summary saved locally (API connection issue)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Radiology Modal */}
      {selectedReport && radiologyImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🩻 Radiology Report</h2>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setRadiologyImage(null);
                  if (viewerRef.current) viewerRef.current.destroy();
                  viewerRef.current = null;
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div ref={containerRef} style={{ width: "100%", height: "500px" }} className="rounded-lg overflow-hidden"></div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Report Details</h3>
              <p><strong>Patient:</strong> {patient.firstName} {patient.lastName}</p>
              <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
              <p><strong>Type:</strong> {selectedReport.type}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}