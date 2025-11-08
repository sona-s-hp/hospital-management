'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CreditCard, 
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Stethoscope,
  Calendar,
  DollarSign
} from "lucide-react";

export default function PatientDischarge() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch(`${API}/api/discharge/all`);
        const data = await res.json();
        if (data.success) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          setSummaries(data.summaries.filter((s: any) => s.patientEmail === user.email));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  const handlePayment = async (summary: any) => {
    const confirmed = confirm(`Pay ₹${summary.billing.totalAmount}?`);
    if (!confirmed) return;

    const res = await fetch(`${API}/api/discharge/markPaid/${summary._id}`, { method: "PATCH" });
    const data = await res.json();
    if (data.success) {
      alert("Payment successful!");
      setSummaries(prev => prev.map(s => s._id === summary._id ? {...s, paymentStatus: "Paid"} : s));
    } else {
      alert("Payment failed. Try again.");
    }
  };

  const openPopup = (htmlContent: string, title: string) => {
    const popup = window.open("", "_blank");
    if (!popup) return;
    popup.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; }
            h1, h2 { color: #4b0082; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
            th { background: #f3e8ff; font-weight: 600; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
            .total { font-weight: bold; color: #000; background: #f0f0f0; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 HealthPlus Multicare Hospital</h1>
            <p>Quality Healthcare Services</p>
          </div>
          ${htmlContent}
          <div class="footer">
            <p>Thank you for choosing HealthPlus Multicare Hospital 💜</p>
            <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px; background: #4b0082; color: white; border: none; border-radius: 5px; cursor: pointer;">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
  };

  const handleViewSummary = (s: any) => {
    const html = `
      <div class="section">
        <h2>Discharge Summary</h2>
        <p><strong>Date:</strong> ${s.date}</p>
      </div>
      
      <div class="section">
        <h2>Doctor Details</h2>
        <p><strong>Name:</strong> ${s.doctorName}</p>
        <p><strong>Specialization:</strong> ${s.specialization}</p>
      </div>

      <div class="section">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${s.patientName}</p>
        <p><strong>Email:</strong> ${s.patientEmail}</p>
        <p><strong>Phone:</strong> ${s.patientPhone}</p>
      </div>

      <div class="section">
        <h2>Billing Summary</h2>
        <table>
          <tr><th>Category</th><th>Amount (₹)</th></tr>
          <tr><td>Pharmacy</td><td>${s.billing.pharmacyTotal}</td></tr>
          <tr><td>Lab Tests</td><td>${s.billing.labTotal}</td></tr>
          <tr><td>Radiology</td><td>${s.billing.radiologyTotal}</td></tr>
          <tr><td>Service Charge</td><td>${s.billing.serviceCharge}</td></tr>
          <tr><td>Consultation Fee</td><td>${s.billing.consultationFee}</td></tr>
          <tr class="total"><td>Total Amount</td><td>₹${s.billing.totalAmount}</td></tr>
        </table>
      </div>
    `;
    openPopup(html, "Discharge Summary");
  };

  const handleBillGenerated = (s: any) => {
    const html = `
      <div class="section">
        <h2>Final Bill Receipt</h2>
        <p><strong>Invoice ID:</strong> ${s._id}</p>
        <p><strong>Date:</strong> ${s.date}</p>
      </div>

      <div class="section">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${s.patientName}</p>
        <p><strong>Email:</strong> ${s.patientEmail}</p>
        <p><strong>Phone:</strong> ${s.patientPhone}</p>
      </div>

      <div class="section">
        <h2>Charges Breakdown</h2>
        <table>
          <tr><th>Category</th><th>Amount (₹)</th></tr>
          <tr><td>Pharmacy</td><td>${s.billing.pharmacyTotal}</td></tr>
          <tr><td>Lab Tests</td><td>${s.billing.labTotal}</td></tr>
          <tr><td>Radiology</td><td>${s.billing.radiologyTotal}</td></tr>
          <tr><td>Service Charge</td><td>${s.billing.serviceCharge}</td></tr>
          <tr><td>Consultation Fee</td><td>${s.billing.consultationFee}</td></tr>
          <tr class="total"><td>Total Amount</td><td>₹${s.billing.totalAmount}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Payment Details</h2>
        <p><strong>Status:</strong> ${s.paymentStatus}</p>
        <p><strong>Mode:</strong> Online Payment</p>
        <p><strong>Transaction ID:</strong> TXN-${s._id.slice(-6).toUpperCase()}</p>
        <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    openPopup(html, "Final Bill Receipt");
  };

  const filteredSummaries = summaries.filter(summary => {
    if (filter === "all") return true;
    if (filter === "pending") return summary.paymentStatus === "Pending";
    if (filter === "paid") return summary.paymentStatus === "Paid";
    return true;
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
          <h1 className="text-3xl font-bold text-gray-900">Discharge Summaries</h1>
          <div className="w-24"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{summaries.length}</p>
                <p className="text-sm text-gray-600">Total Summaries</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summaries.filter(s => s.paymentStatus === "Pending").length}
                </p>
                <p className="text-sm text-gray-600">Pending Payment</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summaries.filter(s => s.paymentStatus === "Paid").length}
                </p>
                <p className="text-sm text-gray-600">Paid</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{summaries.reduce((total, s) => total + (s.billing?.totalAmount || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 w-fit">
            {["all", "pending", "paid"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summaries List */}
        <div className="space-y-6">
          {filteredSummaries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Discharge Summaries</h3>
              <p className="text-gray-600">You don't have any {filter !== 'all' ? filter : ''} discharge summaries.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredSummaries.map((summary, index) => (
                <motion.div
                  key={summary._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Summary Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{summary.doctorName}</h3>
                          <p className="text-purple-600 font-medium">{summary.specialization}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{summary.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{summary.billing.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col space-y-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        summary.paymentStatus === "Paid" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {summary.paymentStatus === "Paid" ? "Paid" : "Payment Pending"}
                      </div>
                      
                      <div className="flex space-x-2">
                        {summary.paymentRequested && summary.paymentStatus === "Pending" && (
                          <button
                            onClick={() => handlePayment(summary)}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>Pay Now</span>
                          </button>
                        )}

                        {summary.paymentStatus === "Paid" && (
                          <>
                            <button
                              onClick={() => handleViewSummary(summary)}
                              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Summary</span>
                            </button>
                            <button
                              onClick={() => handleBillGenerated(summary)}
                              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              <span>Bill</span>
                            </button>
                          </>
                        )}

                        {!summary.paymentRequested && (
                          <div className="flex items-center space-x-2 text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Waiting for admin</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}