// app/pharmacy/prescription/page.tsx - Enhanced with Modern UI
'use client';
import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  User, 
  Mail, 
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Pill,
  ShoppingCart,
  RefreshCw
} from "lucide-react";

export default function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    dispensed: 0,
    today: 0
  });

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/prescription");
      const data = await res.json();
      if (data.success) {
        const pharmacyPrescriptions = data.prescriptions.filter((p: any) => p.type === "pharmacy");
        setPrescriptions(pharmacyPrescriptions);
        updateAnalytics(pharmacyPrescriptions);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = (prescriptions: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    setAnalytics({
      total: prescriptions.length,
      pending: prescriptions.filter(p => p.status === "Pending").length,
      dispensed: prescriptions.filter(p => p.status === "Dispensed").length,
      today: prescriptions.filter(p => {
        const prescriptionDate = new Date(p.createdAt).toISOString().split('T')[0];
        return prescriptionDate === today;
      }).length
    });
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctorId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicines?.some((med: string) => med.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleMarkDispensed = (p: any) => {
    if (activeId === p._id) {
      setActiveId(null);
    } else {
      const meds = Array.isArray(p.medicines) ? p.medicines : [];
      const initial = (p.dispenseDetails && p.dispenseDetails.length > 0
        ? p.dispenseDetails
        : meds.map((m: string) => ({
            name: m,
            timing: { morning: false, afternoon: false, evening: false },
            food: "after",
            slipCount: 1,
            amountPerSlip: "",
          })));

      setFormData((prev) => ({ ...prev, [p._id]: initial }));
      setActiveId(p._id);
    }
  };

  const handleTimingToggle = (id: string, index: number, time: string) => {
    setFormData((prev) => {
      const copy = [...prev[id]];
      const med = { ...copy[index] };
      med.timing = { ...med.timing, [time]: !med.timing[time] };
      copy[index] = med;
      return { ...prev, [id]: copy };
    });
  };

  const handleChange = (id: string, index: number, field: string, value: any) => {
    setFormData((prev) => {
      const copy = [...prev[id]];
      copy[index][field] = value;
      return { ...prev, [id]: copy };
    });
  };

  const calculateTotal = (data: any[]) => {
    return data.reduce((sum, item) => {
      const total = (Number(item.slipCount) || 0) * (Number(item.amountPerSlip) || 0);
      return sum + total;
    }, 0);
  };

  const handleSubmitDispense = async (p: any) => {
    const currentData = formData[p._id] || [];
    const totalAmount = calculateTotal(currentData);

    if (!Array.isArray(currentData) || currentData.length === 0) {
      alert("⚠️ Please fill medicine details before saving!");
      return;
    }

    try {
      const res = await axios.put(`/api/prescription/dispense/${p._id}`, {
        dispenseDetails: currentData,
        totalAmount,
      });

      if (res.data.success) {
        alert("✅ Dispensed successfully!");
        const pharmacyUser = JSON.parse(localStorage.getItem("user") || "{}");
        const pharmacyId = pharmacyUser?._id;
        
        if (pharmacyId) {
          const toReduce = currentData.map((m) => ({
            name: m.name,
            qty: Number(m.slipCount) || 1,
          }));

          await axios.post(`/api/pharmacy/reduce`, {
            pharmacyId,
            medicines: toReduce,
          });
        }

        fetchPrescriptions();
        setActiveId(null);
      }
    } catch (err: any) {
      console.error("Dispense error:", err);
      alert("🚨 Server error while saving dispense details");
    }
  };

  const handlePrintReport = (p: any, dispensedData: any[], totalAmount: number) => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    const medRows = dispensedData
      .map((m) => {
        const times = Object.keys(m.timing)
          .filter((t) => m.timing[t])
          .join(", ");
        return `
          <tr>
            <td>${m.name}</td>
            <td>${times || "-"}</td>
            <td>${m.food} food</td>
            <td>${m.slipCount}</td>
            <td>₹${m.amountPerSlip}</td>
            <td style="text-align:right;">₹${(m.slipCount * m.amountPerSlip) || 0}</td>
          </tr>`;
      })
      .join("");

    reportWindow.document.write(`
      <html>
      <head>
        <title>Prescription Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; }
          h1 { text-align: center; color: #059669; margin-bottom: 5px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .header span { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background-color: #d1fae5; }
          .total { text-align: right; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-style: italic; color: #333; }
        </style>
      </head>
      <body>
        <h1>🏥 Zane Care Medical Hospital</h1>
        <div class="header">
          <span>Pharmacy: Main Pharmacy</span>
          <span>Doctor: ${p.doctorId?.firstName || ""} ${p.doctorId?.lastName || ""} (${p.doctorId?.specialization || p.doctorId?.department || "Doctor"})</span>
        </div>
        <div><strong>Patient:</strong> ${p.patientId?.firstName || ""} ${p.patientId?.lastName || ""}</div>
        <div><strong>Email:</strong> ${p.patientId?.email || "N/A"}</div>
        <div><strong>Doctor Note:</strong> ${p.note || "N/A"}</div>

        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Timing</th>
              <th>Before/After Food</th>
              <th>No. of Slips</th>
              <th>Amount / Slip (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${medRows}
            <tr>
              <td colspan="5" class="total">Total Amount</td>
              <td style="text-align:right;">₹${totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          ✅ Verified and dispensed by Pharmacy Department.
        </div>
      </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.print();
  };

  const statsCards = [
    {
      title: "Total Prescriptions",
      value: analytics.total,
      icon: FileText,
      color: "bg-blue-500",
      description: "All time"
    },
    {
      title: "Pending",
      value: analytics.pending,
      icon: Clock,
      color: "bg-orange-500",
      description: "Need processing"
    },
    {
      title: "Dispensed",
      value: analytics.dispensed,
      icon: CheckCircle,
      color: "bg-green-500",
      description: "Completed"
    },
    {
      title: "Today's",
      value: analytics.today,
      icon: Calendar,
      color: "bg-purple-500",
      description: "New today"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-green-700 mr-4 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pharmacy Prescriptions</h1>
                <p className="text-gray-600 mt-1">Manage and process doctor prescriptions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchPrescriptions}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients, doctors, medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispensed">Dispensed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                Prescription Requests
                <span className="text-sm text-gray-500 font-normal ml-2">
                  ({filteredPrescriptions.length} found)
                </span>
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Dispensed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400" size={64} />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No prescriptions available</h3>
              <p className="mt-2 text-gray-600">No prescriptions match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPrescriptions.map((p) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                          <User className="text-green-600" size={20} />
                          <span className="font-semibold text-gray-900">
                            {p.patientId?.firstName} {p.patientId?.lastName}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{p.patientId?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="text-blue-600" size={18} />
                          <span className="text-gray-600">
                            Dr. {p.doctorId?.firstName} {p.doctorId?.lastName}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {p.doctorId?.specialization || p.doctorId?.department}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Medicines:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.medicines?.map((medicine: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                <Pill size={12} className="mr-1" />
                                {medicine}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          {p.note && (
                            <div>
                              <span className="font-medium text-gray-700">Doctor's Note:</span>
                              <p className="text-sm text-gray-600 mt-1">{p.note}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                        {p.updatedAt !== p.createdAt && (
                          <span>Updated: {new Date(p.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        p.status === "Dispensed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {p.status === "Dispensed" ? (
                          <CheckCircle className="mr-1" size={16} />
                        ) : (
                          <Clock className="mr-1" size={16} />
                        )}
                        {p.status}
                      </div>

                      {p.status === "Pending" && (
                        <button
                          onClick={() => handleMarkDispensed(p)}
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition ${
                            activeId === p._id
                              ? "bg-gray-600 text-white hover:bg-gray-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {activeId === p._id ? (
                            <>
                              <Eye className="mr-2" size={18} />
                              Close
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2" size={18} />
                              Process
                            </>
                          )}
                        </button>
                      )}

                      {p.status === "Dispensed" && (
                        <button
                          onClick={() =>
                            handlePrintReport(p, p.dispenseDetails || [], p.totalAmount || 0)
                          }
                          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                        >
                          <Download className="mr-2" size={18} />
                          View Report
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Dispense Form */}
                  <AnimatePresence>
                    {activeId === p._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-green-50 rounded-xl p-6 border border-green-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-green-800">
                            🧾 Dispense Medicines
                          </h3>
                          <div className="text-sm text-green-700">
                            Patient: {p.patientId?.firstName} {p.patientId?.lastName}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {formData[p._id]?.map((m, index) => (
                            <div
                              key={index}
                              className="border border-green-200 bg-white p-4 rounded-lg shadow-sm"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-green-700 text-lg">
                                  {m.name}
                                </h4>
                                <div className="text-green-800 font-semibold">
                                  Total: ₹{(m.slipCount * m.amountPerSlip) || 0}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Timing */}
                                <div>
                                  <label className="font-medium text-gray-700 mb-3 block">
                                    Dosage Timing
                                  </label>
                                  <div className="space-y-2">
                                    {["morning", "afternoon", "evening"].map((t) => (
                                      <label key={t} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={m.timing[t]}
                                          onChange={() =>
                                            handleTimingToggle(p._id, index, t)
                                          }
                                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <span className="capitalize text-sm text-gray-700">{t}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Food */}
                                <div>
                                  <label className="font-medium text-gray-700 mb-3 block">
                                    Food Relation
                                  </label>
                                  <div className="space-y-2">
                                    {["before", "after"].map((f) => (
                                      <label key={f} className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          name={`food-${p._id}-${index}`}
                                          checked={m.food === f}
                                          onChange={() =>
                                            handleChange(p._id, index, "food", f)
                                          }
                                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="capitalize text-sm text-gray-700">{f} food</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Slip Count */}
                                <div>
                                  <label className="font-medium text-gray-700 mb-2 block">
                                    Number of Slips
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={m.slipCount}
                                    onChange={(e) =>
                                      handleChange(
                                        p._id,
                                        index,
                                        "slipCount",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter slips"
                                  />
                                </div>

                                {/* Amount */}
                                <div>
                                  <label className="font-medium text-gray-700 mb-2 block">
                                    Amount per Slip (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={m.amountPerSlip}
                                    onChange={(e) =>
                                      handleChange(
                                        p._id,
                                        index,
                                        "amountPerSlip",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
                          <div className="flex flex-col sm:flex-row justify-between items-center">
                            <div className="text-center sm:text-left mb-4 sm:mb-0">
                              <div className="text-2xl font-bold text-green-800">
                                ₹{calculateTotal(formData[p._id] || [])}
                              </div>
                              <div className="text-sm text-green-600">Grand Total Amount</div>
                            </div>
                            <button
                              onClick={() => handleSubmitDispense(p)}
                              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-sm"
                            >
                              <ShoppingCart size={18} />
                              <span>Save & Generate Report</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}