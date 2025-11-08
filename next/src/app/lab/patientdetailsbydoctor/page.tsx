// app/lab/patientdetailsbydoctor/page.tsx - Fixed Version
'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  FileText, 
  User, 
  Mail, 
  Stethoscope,
  Clock,
  CheckCircle,
  Download,
  TestTube,
  Microscope,
  BarChart3,
  RefreshCw
} from "lucide-react";

export default function LabRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [selectedTests, setSelectedTests] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    today: 0
  });

  const testPanels: Record<string, string[]> = {
    "Thyroid Profile": ["TSH", "Free T3", "Free T4"],
    "Lipid Profile": ["Total Cholesterol", "HDL", "LDL", "Triglycerides"],
    "CBC": ["Hemoglobin", "RBC Count", "WBC Count", "Platelets"],
    "Blood Sugar": ["Fasting Glucose", "Postprandial Glucose"],
    "Electrolyte Panel": ["Sodium", "Potassium", "Chloride"],
    "Hormone Panel": ["Estrogen", "Progesterone", "LH", "FSH"],
    "Vitamin D Test": ["Vitamin D2", "Vitamin D3", "Total Vitamin D"],
    "Calcium Test": ["Serum Calcium", "Ionized Calcium"],
  };

  useEffect(() => {
    fetchLabRequests();
  }, []);

  const fetchLabRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/prescription/lab");
      const data = await res.json();
      if (data.success) {
        setRequests(data.labRequests);
        updateAnalytics(data.labRequests);
      }
    } catch (err) {
      console.error("❌ Error fetching lab requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = (requests: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    setAnalytics({
      total: requests.length,
      pending: requests.filter(r => r.status === "Pending").length,
      completed: requests.filter(r => r.status === "Dispensed").length,
      today: requests.filter(r => {
        const requestDate = new Date(r.createdAt).toISOString().split('T')[0];
        return requestDate === today;
      }).length
    });
  };

  const handleResultChange = (id: string, test: string, field: string, value: string) => {
    setTestResults((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [test]: { ...(prev[id]?.[test] || {}), [field]: value },
      },
    }));
  };

  const toggleSubtest = (id: string, test: string, subtest: string) => {
    setSelectedTests((prev) => {
      const current = prev[id]?.[test] || [];
      const newSelection = current.includes(subtest)
        ? current.filter((t) => t !== subtest)
        : [...current, subtest];
      return {
        ...prev,
        [id]: { ...(prev[id] || {}), [test]: newSelection },
      };
    });
  };

  const handleSaveResults = async (id: string, tests: string[]) => {
    const expandedTests = tests.flatMap((test) => {
      const subtests = testPanels[test]
        ? selectedTests[id]?.[test] || testPanels[test]
        : [test];
      return subtests.map((sub) => ({
        name: sub,
        result: testResults[id]?.[sub]?.value || "",
        unit: testResults[id]?.[sub]?.unit || "",
        reference: testResults[id]?.[sub]?.reference || "",
      }));
    });

    try {
      const res = await fetch(`/api/prescription/dispense/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dispensed", dispenseDetails: expandedTests }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Results saved successfully!");
        setRequests((prev) =>
          prev.map((r) =>
            r._id === id
              ? { ...r, status: "Dispensed", dispenseDetails: expandedTests }
              : r
          )
        );
        setActiveForm(null);
        fetchLabRequests();
      } else {
        alert("⚠️ Failed to save results!");
      }
    } catch (err) {
      console.error("❌ Error saving results:", err);
      alert("⚠️ Failed to save results. Check console.");
    }
  };

  const handleViewReport = (r: any) => {
    const results = r.dispenseDetails?.length
      ? r.dispenseDetails
      : Object.entries(testResults[r._id] || {}).map(([name, val]: any) => ({
          name,
          result: val.value || "-",
          unit: val.unit || "-",
          reference: val.reference || "-",
        }));

    const rows = results
      .map(
        (d: any) => `
        <tr>
          <td>${d.name}</td>
          <td>${d.result || "-"}</td>
          <td>${d.unit || "-"}</td>
          <td>${d.reference || "-"}</td>
        </tr>`
      )
      .join("");

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    reportWindow.document.write(`
      <html>
      <head>
        <title>Lab Report</title>
        <style>
          body { font-family: Arial; padding: 30px; }
          h1 { text-align: center; color: #2563eb; margin-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background-color: #dbeafe; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>🏥 Zane Care Medical Hospital</h1>
        <div class="header">
          <div>
            <p><strong>Doctor:</strong> ${r.doctorId?.firstName || ""} ${r.doctorId?.lastName || ""}</p>
            <p><strong>Specialization:</strong> ${r.doctorId?.specialization || "N/A"}</p>
          </div>
          <div>
            <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <p><strong>Patient:</strong> ${r.patientId?.firstName || ""} ${r.patientId?.lastName || ""}</p>
          <p><strong>Email:</strong> ${r.patientId?.email || ""}</p>
          <p><strong>Clinical Note:</strong> ${r.note || "N/A"}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Test Parameter</th>
              <th>Result</th>
              <th>Unit</th>
              <th>Reference Range</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          ✅ Verified and certified by Laboratory Department
        </div>
      </body>
      </html>
    `);
    reportWindow.document.close();
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.doctorId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.medicines?.some((med: string) => med.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || r.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    {
      title: "Total Requests",
      value: analytics.total,
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      title: "Pending",
      value: analytics.pending,
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "Completed",
      value: analytics.completed,
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "Today's",
      value: analytics.today,
      icon: BarChart3,
      color: "bg-purple-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lab requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-blue-700 mr-4 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Laboratory Test Requests</h1>
                <p className="text-gray-600 mt-1">Manage and process diagnostic test requests</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchLabRequests}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients, doctors, tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispensed">Completed</option>
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
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Test Requests
              <span className="text-sm text-gray-500 font-normal ml-2">
                ({filteredRequests.length} found)
              </span>
            </h2>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No test requests</h3>
              <p className="text-gray-600">No requests match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((r) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                          <User className="text-blue-600" size={20} />
                          <span className="font-semibold text-gray-900">
                            {r.patientId?.firstName} {r.patientId?.lastName}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{r.patientId?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="text-green-600" size={18} />
                          <span className="text-gray-600">
                            Dr. {r.doctorId?.firstName} {r.doctorId?.lastName}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {r.doctorId?.specialization}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Tests Requested:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.medicines?.map((test: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                <Microscope size={12} className="mr-1" />
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          {r.note && (
                            <div>
                              <span className="font-medium text-gray-700">Clinical Note:</span>
                              <p className="text-sm text-gray-600 mt-1">{r.note}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Requested: {new Date(r.createdAt).toLocaleDateString()}</span>
                        {r.updatedAt !== r.createdAt && (
                          <span>Updated: {new Date(r.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        r.status === "Dispensed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {r.status === "Dispensed" ? (
                          <CheckCircle className="mr-1" size={16} />
                        ) : (
                          <Clock className="mr-1" size={16} />
                        )}
                        {r.status === "Dispensed" ? "Completed" : "Pending"}
                      </div>

                      {r.status === "Pending" ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setActiveForm(activeForm === r._id ? null : r._id)}
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition ${
                            activeForm === r._id
                              ? "bg-gray-600 text-white hover:bg-gray-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {activeForm === r._id ? (
                            <>
                              <Eye className="mr-2" size={18} />
                              Close
                            </>
                          ) : (
                            <>
                              <TestTube className="mr-2" size={18} />
                              Enter Results
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleViewReport(r)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                        >
                          <Download className="mr-2" size={18} />
                          View Report
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Results Form */}
                  <AnimatePresence>
                    {activeForm === r._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-blue-800">
                            🔬 Enter Test Results
                          </h3>
                          <div className="text-sm text-blue-700">
                            Patient: {r.patientId?.firstName} {r.patientId?.lastName}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(r.medicines || []).map((test: string) => (
                            <div key={test} className="border border-blue-200 bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-semibold text-blue-700 mb-3 text-lg">
                                {test}
                              </h4>
                              {(testPanels[test] || [test]).map((subtest) => (
                                <div key={subtest} className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded">
                                  <input
                                    type="checkbox"
                                    checked={selectedTests[r._id]?.[test]?.includes(subtest) || false}
                                    onChange={() => toggleSubtest(r._id, test, subtest)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="flex-1 text-sm font-medium text-gray-700 min-w-32">{subtest}</span>
                                  <input
                                    type="text"
                                    placeholder="Result"
                                    value={testResults[r._id]?.[subtest]?.value || ""}
                                    onChange={(e) =>
                                      handleResultChange(r._id, subtest, "value", e.target.value)
                                    }
                                    className="border border-gray-300 rounded px-3 py-1 w-24 text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Unit"
                                    value={testResults[r._id]?.[subtest]?.unit || ""}
                                    onChange={(e) =>
                                      handleResultChange(r._id, subtest, "unit", e.target.value)
                                    }
                                    className="border border-gray-300 rounded px-3 py-1 w-20 text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Reference"
                                    value={testResults[r._id]?.[subtest]?.reference || ""}
                                    onChange={(e) =>
                                      handleResultChange(r._id, subtest, "reference", e.target.value)
                                    }
                                    className="border border-gray-300 rounded px-3 py-1 w-28 text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleSaveResults(r._id, r.medicines)}
                          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm"
                        >
                          💾 Save All Results
                        </motion.button>
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