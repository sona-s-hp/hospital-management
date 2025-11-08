'use client';
import { useEffect, useState } from "react";
import { 
  FileText, 
  User, 
  Stethoscope, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Pill,
  Microscope,
  Scan,
  Building
} from 'lucide-react';

export default function AdminDischargeSummary() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch(`${API}/api/discharge/all`);
        const data = await res.json();
        if (data.success) {
          setSummaries(data.summaries || []);
        } else {
          setError(data.message || "Failed to load summaries");
        }
      } catch (err) {
        console.error("Error fetching summaries:", err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  const handleRequestPayment = async (summaryId: string) => {
    try {
      const res = await fetch(`${API}/api/discharge/requestPayment/${summaryId}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setSuccess("Payment requested successfully! Patient has been notified.");
        setTimeout(() => setSuccess(""), 3000);
        // Update local state
        setSummaries(prev => prev.map(s => 
          s._id === summaryId ? { ...s, paymentRequested: true, paymentStatus: "Pending" } : s
        ));
      } else {
        setError("Failed to request payment");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error requesting payment:", err);
      setError("Network error. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Filter summaries based on search and payment status
  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch = 
      !searchTerm ||
      summary.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "pending" && summary.paymentStatus === "Pending") ||
      (filterStatus === "paid" && summary.paymentStatus === "Paid") ||
      (filterStatus === "unrequested" && !summary.paymentRequested);
    
    return matchesSearch && matchesStatus;
  });

  // Get discharge statistics
  const totalSummaries = summaries.length;
  const pendingPayments = summaries.filter(s => s.paymentStatus === "Pending").length;
  const paidSummaries = summaries.filter(s => s.paymentStatus === "Paid").length;
  const totalRevenue = summaries.reduce((total, s) => total + (s.billing?.totalAmount || 0), 0);

  const getPaymentStatusColor = (summary: any) => {
    if (summary.paymentStatus === "Paid") return "from-green-500 to-emerald-500";
    if (summary.paymentStatus === "Pending") return "from-yellow-500 to-amber-500";
    return "from-gray-500 to-gray-600";
  };

  const getPaymentStatusIcon = (summary: any) => {
    if (summary.paymentStatus === "Paid") return <CheckCircle className="w-5 h-5 text-white" />;
    if (summary.paymentStatus === "Pending") return <Clock className="w-5 h-5 text-white" />;
    return <AlertCircle className="w-5 h-5 text-white" />;
  };

  const getPaymentStatusText = (summary: any) => {
    if (summary.paymentStatus === "Paid") return "Paid";
    if (summary.paymentStatus === "Pending") return "Payment Pending";
    return "Payment Not Requested";
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading discharge summaries...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Discharge Summaries
            </h1>
          </div>
          <p className="text-gray-600">
            Manage patient discharge processes and billing settlements
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Discharges</p>
              <p className="text-2xl font-bold text-gray-900">{totalSummaries}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{paidSummaries}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {success}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient name, doctor, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-lg transition-all duration-300"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-lg transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="unrequested">Payment Not Requested</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Discharge Summaries Grid */}
      {filteredSummaries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No discharge summaries found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No discharge summaries have been created yet"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredSummaries.map((summary) => (
            <div key={summary._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getPaymentStatusColor(summary)} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {getPaymentStatusIcon(summary)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{summary.patientName}</h3>
                    <p className="text-purple-600 font-medium">Discharge Summary</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Patient and Doctor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope size={16} className="text-blue-500" />
                    <div>
                      <p className="font-semibold">Dr. {summary.doctorName}</p>
                      <p className="text-xs">{summary.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-green-500" />
                    <span>{new Date(summary.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-purple-500" />
                    <span className="truncate">{summary.patientEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-orange-500" />
                    <span>{summary.patientPhone}</span>
                  </div>
                </div>
              </div>

              {/* Billing Summary */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-green-600" />
                  Billing Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Pill size={14} className="text-blue-500" />
                      Pharmacy
                    </span>
                    <span className="font-semibold">₹{summary.billing?.pharmacyTotal || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Microscope size={14} className="text-green-500" />
                      Lab Tests
                    </span>
                    <span className="font-semibold">₹{summary.billing?.labTotal || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Scan size={14} className="text-purple-500" />
                      Radiology
                    </span>
                    <span className="font-semibold">₹{summary.billing?.radiologyTotal || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Building size={14} className="text-orange-500" />
                      Services
                    </span>
                    <span className="font-semibold">₹{summary.billing?.serviceCharge || 0}</span>
                  </div>
                </div>
                
                {/* Total Amount */}
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-lg font-bold">₹{summary.billing?.totalAmount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Payment Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    summary.paymentStatus === "Paid" 
                      ? "bg-green-100 text-green-800" 
                      : summary.paymentStatus === "Pending" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {getPaymentStatusText(summary)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
                    <Eye size={16} />
                    <span>View Full</span>
                  </button>
                  
                  {!summary.paymentRequested && (
                    <button
                      onClick={() => handleRequestPayment(summary._id)}
                      className="flex items-center gap-1 bg-yellow-600 text-white px-3 py-2 rounded-xl hover:bg-yellow-700 transition-colors font-medium text-sm"
                    >
                      <CreditCard size={16} />
                      <span>Request Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Summary Footer */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Revenue Management</h2>
            <p className="text-purple-100">
              Managing discharge settlements with ₹{totalRevenue.toLocaleString()} in total revenue. 
              {pendingPayments > 0 && ` ${pendingPayments} payments pending collection.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <CreditCard size={16} className="text-white" />
              <span className="font-semibold">₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <TrendingUp size={16} className="text-white" />
              <span className="font-semibold">Revenue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}