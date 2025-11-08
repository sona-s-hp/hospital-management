"use client";
import { useEffect, useState } from "react";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Building,
  Pill,
  TrendingUp,
  BarChart3,
  Search,
  User
} from 'lucide-react';

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admins/stockrequests`);
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) { 
      console.error(err);
      setError("Failed to load stock requests");
    }
    setLoading(false);
  };

  const approve = async (reqId: string) => {
    const approvedQty = prompt("Approved quantity (number):", "50");
    if (!approvedQty) return;
    
    if (!/^\d+$/.test(approvedQty)) {
      setError("Please enter a valid number for quantity");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const adminId = JSON.parse(localStorage.getItem("user") || "{}")._id || null;
      const res = await fetch(`/api/admins/stockrequests/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: reqId,
          approvedQty: Number(approvedQty),
          processedBy: adminId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Stock request approved successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchRequests();
      } else {
        setError(data.message || "Failed to approve request");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const reject = async (reqId: string) => {
    const notes = prompt("Reason for rejection (optional):", "");
    if (notes === null) return;
    
    try {
      const adminId = JSON.parse(localStorage.getItem("user") || "{}")._id || null;
      const res = await fetch(`/api/admins/stockrequests/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          requestId: reqId, 
          processedBy: adminId, 
          notes 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Stock request rejected successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchRequests();
      } else {
        setError(data.message || "Failed to reject request");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Filter requests based on status and search
  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesSearch = 
      !searchTerm ||
      request.medicine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.pharmacyId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Get request statistics
  const pendingRequests = requests.filter(r => r.status === "requested").length;
  const approvedRequests = requests.filter(r => r.status === "approved").length;
  const rejectedRequests = requests.filter(r => r.status === "rejected").length;
  const totalRequests = requests.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "from-green-500 to-emerald-500";
      case "rejected": return "from-red-500 to-rose-500";
      case "requested": return "from-blue-500 to-cyan-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-5 h-5 text-white" />;
      case "rejected": return <XCircle className="w-5 h-5 text-white" />;
      case "requested": return <Clock className="w-5 h-5 text-white" />;
      default: return <AlertTriangle className="w-5 h-5 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      case "requested": return "Pending Review";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-teal-900 to-green-900 bg-clip-text text-transparent">
              Stock Requests
            </h1>
          </div>
          <p className="text-gray-600">
            Manage and review medication stock requests from pharmacy partners
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Request Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedRequests}</p>
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
              placeholder="Search by medicine name or pharmacy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-lg transition-all duration-300"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-lg transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="requested">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stock requests...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getStatusColor(request.status)} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{request.medicine}</h3>
                    <p className="text-teal-600 font-medium">Stock Request</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Pill size={16} className="text-blue-500" />
                  <span>
                    <strong>Requested:</strong> {request.requestedQty} units
                  </span>
                </div>
                
                {request.approvedQty && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>
                      <strong>Approved:</strong> {request.approvedQty} units
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={16} className="text-orange-500" />
                  <span className="truncate">{request.pharmacyId}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-purple-500" />
                  <span>Submitted {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>

                {request.notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                    <span className="line-clamp-2">{request.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === "approved" 
                      ? "bg-green-100 text-green-800" 
                      : request.status === "rejected" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors">
                    <Eye size={16} />
                    <span>Details</span>
                  </button>
                  
                  {request.status === "requested" && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => approve(request._id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => reject(request._id)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stock requests found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No stock requests have been submitted yet"
            }
          </p>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Inventory Management</h2>
            <p className="text-teal-100">
              Currently reviewing {pendingRequests} pending stock requests. Ensure timely approvals to maintain pharmacy inventory levels.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <Truck size={16} className="text-white" />
              <span className="font-semibold">{pendingRequests} Pending</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <TrendingUp size={16} className="text-white" />
              <span className="font-semibold">Stock Control</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}