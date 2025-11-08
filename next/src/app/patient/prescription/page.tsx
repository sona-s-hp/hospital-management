"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Pill, 
  Syringe, 
  User, 
  Calendar,
  Clock,
  Stethoscope,
  Eye,
  Printer,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

export default function PatientPrescriptions() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("prescriptions");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch patient info
        const patRes = await fetch(`/api/patient/byUser/${user._id}`);
        const patData = await patRes.json();
        if (!patData.success || !patData.patient) return;

        const patientId = patData.patient._id;

        // Fetch prescriptions
        const presRes = await fetch(`/api/prescription`);
        const presData = await presRes.json();
        if (presData.success) {
          const filtered = presData.prescriptions.filter(
            (p: any) => p.patientId?._id === patientId
          );
          setPrescriptions(filtered);
        }

        // Fetch vaccination reports
        const vaccRes = await fetch(`/api/vaccination/patient/${patientId}`);
        const vaccData = await vaccRes.json();
        if (vaccData.success) {
          setVaccinations(vaccData.requests || []);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewPrescription = (p: any) => {
    if (!p.dispenseDetails || p.dispenseDetails.length === 0) {
      alert("No report available for this prescription yet.");
      return;
    }

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    const type = p.type || "pharmacy";
    const isPharmacy = type === "pharmacy";
    const isLab = type === "lab";
    const isRadiology = type === "radiology";

    let tableContent = '';
    
    if (isPharmacy) {
      tableContent = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #4f46e5; color: white;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Medicine</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Timing</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Food Instructions</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${p.dispenseDetails.map((m: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${m.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${Object.keys(m.timing || {}).filter((t) => m.timing[t]).join(", ")}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${m.food ? `${m.food} food` : "-"}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${m.amount || 0}</td>
              </tr>
            `).join('')}
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total Amount:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">₹${p.totalAmount || 0}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (isLab) {
      tableContent = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #059669; color: white;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Test</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Result</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Unit</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Reference Range</th>
            </tr>
          </thead>
          <tbody>
            ${p.dispenseDetails.map((d: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${d.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${d.result || "-"}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${d.unit || "-"}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${d.reference || "-"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    reportWindow.document.write(`
      <html>
        <head>
          <title>${type.toUpperCase()} Report - ${p.patientId?.firstName} ${p.patientId?.lastName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              line-height: 1.6; 
              color: #333;
              max-width: 1000px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px;
              border-bottom: 3px solid #4f46e5;
              padding-bottom: 20px;
            }
            .patient-info, .doctor-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .print-btn {
              background: #4f46e5;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 20px;
            }
            .note {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #d97706;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #4f46e5; margin-bottom: 10px;">🏥 HealthPlus Hospital</h1>
            <h2 style="color: #333; margin-bottom: 5px;">${type.toUpperCase()} REPORT</h2>
            <p style="color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="patient-info">
            <h3 style="color: #4f46e5; margin-bottom: 10px;">Patient Information</h3>
            <p><strong>Name:</strong> ${p.patientId?.firstName} ${p.patientId?.lastName}</p>
            <p><strong>Date:</strong> ${new Date(p.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="doctor-info">
            <h3 style="color: #4f46e5; margin-bottom: 10px;">Doctor Information</h3>
            <p><strong>Doctor:</strong> Dr. ${p.doctorId?.firstName} ${p.doctorId?.lastName}</p>
            <p><strong>Specialization:</strong> ${p.doctorId?.specialization || p.doctorId?.department}</p>
          </div>

          ${p.note ? `<div class="note"><strong>Doctor's Note:</strong> ${p.note}</div>` : ''}

          ${tableContent}

          <div class="footer">
            <p>This is an electronically generated report. No signature required.</p>
            <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const handleViewVaccination = (v: any) => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    const proceduresRows = (v.procedures || [])
      .map((proc: any) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${proc.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${proc.notes || "-"}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(proc.performedAt).toLocaleDateString()}</td>
        </tr>
      `).join("");

    reportWindow.document.write(`
      <html>
      <head>
        <title>Vaccination Report - ${v.patient?.firstName} ${v.patient?.lastName}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
          }
          .patient-info, .doctor-info {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #059669;
            color: white;
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
          }
          td {
            padding: 10px;
            border: 1px solid #ddd;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .print-btn {
            background: #059669;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #059669; margin-bottom: 10px;">🏥 HealthPlus Hospital</h1>
          <h2 style="color: #333; margin-bottom: 5px;">VACCINATION REPORT</h2>
          <p style="color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="patient-info">
          <h3 style="color: #059669; margin-bottom: 10px;">Patient Information</h3>
          <p><strong>Name:</strong> ${v.patient?.firstName} ${v.patient?.lastName}</p>
          <p><strong>Vaccine:</strong> ${v.vaccineType}</p>
          <p><strong>Date:</strong> ${new Date(v.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${v.status}</p>
        </div>

        <div class="doctor-info">
          <h3 style="color: #059669; margin-bottom: 10px;">Medical Professional</h3>
          <p><strong>Doctor:</strong> ${v.doctor?.firstName || ""} ${v.doctor?.lastName || ""}</p>
          <p><strong>Specialization:</strong> ${v.doctor?.specialization || "General"}</p>
        </div>

        <h3 style="color: #059669; margin-top: 30px;">Procedure Details</h3>
        <table>
          <thead>
            <tr>
              <th>Procedure</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${proceduresRows || `<tr><td colspan="3" style="text-align: center;">No procedures recorded</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          <p>This is an electronically generated vaccination report.</p>
          <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
        </div>
      </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  const filteredVaccinations = vaccinations.filter(v => {
    if (filterStatus === "all") return true;
    return v.status === filterStatus;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <div className="w-24"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                <p className="text-sm text-gray-600">Total Prescriptions</p>
              </div>
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{vaccinations.length}</p>
                <p className="text-sm text-gray-600">Vaccinations</p>
              </div>
              <Syringe className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === "Dispensed").length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status !== "Dispensed").length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tab Selection */}
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 w-fit">
              {[
                { id: "prescriptions", label: "Prescriptions", icon: Pill },
                { id: "vaccinations", label: "Vaccinations", icon: Syringe }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === tab.id
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Dispensed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Vaccinated</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescriptions Section */}
        {selectedTab === "prescriptions" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Pill className="h-6 w-6 text-purple-600 mr-2" />
                My Prescriptions
              </h2>
              <span className="text-sm text-gray-600">
                {filteredPrescriptions.length} records found
              </span>
            </div>

            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
                <p className="text-gray-600">You don't have any {filterStatus !== 'all' ? filterStatus.toLowerCase() : ''} prescriptions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPrescriptions.map((prescription, index) => (
                  <motion.div
                    key={prescription._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Prescription Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
                            <Pill className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              Dr. {prescription.doctorId?.firstName} {prescription.doctorId?.lastName}
                            </h3>
                            <p className="text-purple-600 font-medium">
                              {prescription.doctorId?.specialization || prescription.doctorId?.department}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Stethoscope className="h-4 w-4" />
                                <span>{prescription.type || "General"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Medicines Preview */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Medicines & Tests</h4>
                          <div className="flex flex-wrap gap-2">
                            {prescription.medicines.slice(0, 4).map((medicine: string, idx: number) => (
                              <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
                                {medicine}
                              </span>
                            ))}
                            {prescription.medicines.length > 4 && (
                              <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-500 border">
                                +{prescription.medicines.length - 4} more
                              </span>
                            )}
                          </div>
                          {prescription.note && (
                            <p className="text-sm text-gray-600 mt-3">
                              <strong>Note:</strong> {prescription.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end space-y-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          prescription.status === "Dispensed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {prescription.status}
                        </div>
                        
                        <div className="flex space-x-2">
                          {prescription.status === "Dispensed" && (
                            <button
                              onClick={() => handleViewPrescription(prescription)}
                              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>View Report</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleViewPrescription(prescription)}
                            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <Printer className="h-4 w-4" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Vaccinations Section */}
        {selectedTab === "vaccinations" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Syringe className="h-6 w-6 text-green-600 mr-2" />
                My Vaccinations
              </h2>
              <span className="text-sm text-gray-600">
                {filteredVaccinations.length} records found
              </span>
            </div>

            {filteredVaccinations.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vaccination Records</h3>
                <p className="text-gray-600">You don't have any {filterStatus !== 'all' ? filterStatus.toLowerCase() : ''} vaccination records.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredVaccinations.map((vaccination, index) => (
                  <motion.div
                    key={vaccination._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Vaccination Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white">
                            <Syringe className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{vaccination.vaccineType}</h3>
                            <p className="text-green-600 font-medium">
                              {vaccination.doctor ? `Dr. ${vaccination.doctor.firstName} ${vaccination.doctor.lastName}` : "Medical Team"}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(vaccination.date).toLocaleDateString()}</span>
                              </div>
                              {vaccination.time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{vaccination.time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end space-y-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vaccination.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : vaccination.status === "Scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {vaccination.status}
                        </div>
                        
                        <div className="flex space-x-2">
                          {vaccination.status === "Completed" && (
                            <button
                              onClick={() => handleViewVaccination(vaccination)}
                              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>View Certificate</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleViewVaccination(vaccination)}
                            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <Printer className="h-4 w-4" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}