"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Building,
  TrendingUp
} from 'lucide-react';

export default function AdminEmergencyLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emergencyLeave/all");
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves);
      } else {
        setError("Failed to fetch leaves");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (leaveId: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`/api/emergencyLeave/updateStatus/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setLeaves((prev) =>
          prev.map((l) => (l._id === leaveId ? { ...l, status } : l))
        );
        setSuccess(`Leave request ${status.toLowerCase()} successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Failed to update status");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter leaves based on status and search
  const filteredLeaves = leaves.filter((leave) => {
    const matchesStatus = filterStatus === "all" || leave.status === filterStatus;
    const doctor = leave.doctor;
    const matchesSearch = 
      !searchTerm ||
      (doctor && 
        (`${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    return matchesStatus && matchesSearch;
  });

  // Get leave statistics
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const approvedLeaves = leaves.filter(l => l.status === "Approved").length;
  const rejectedLeaves = leaves.filter(l => l.status === "Rejected").length;
  const totalLeaves = leaves.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "from-green-500 to-emerald-500";
      case "Rejected": return "from-red-500 to-rose-500";
      case "Pending": return "from-yellow-500 to-amber-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="w-5 h-5 text-white" />;
      case "Rejected": return <XCircle className="w-5 h-5 text-white" />;
      case "Pending": return <Clock className="w-5 h-5 text-white" />;
      default: return <AlertTriangle className="w-5 h-5 text-white" />;
    }
  };

  const getDaysBetween = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">
              Emergency Leaves
            </h1>
          </div>
          <p className="text-gray-600">
            Manage and review emergency leave requests from medical staff
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeaves}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingLeaves}</p>
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
              <p className="text-2xl font-bold text-gray-900">{approvedLeaves}</p>
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
              <p className="text-2xl font-bold text-gray-900">{rejectedLeaves}</p>
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
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-lg transition-all duration-300"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-lg transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Leaves Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leave requests...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredLeaves.map((leave) => {
            const doctor = leave.doctor;
            const days = getDaysBetween(leave.fromDate, leave.toDate);
            
            return (
              <div key={leave._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getStatusColor(leave.status)} rounded-2xl flex items-center justify-center shadow-lg`}>
                      {getStatusIcon(leave.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor"}
                      </h3>
                      <p className="text-orange-600 font-medium">
                        {days} day{days !== 1 ? 's' : ''} leave
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {doctor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Stethoscope size={16} className="text-blue-500" />
                      <span>{doctor.specialization}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-green-500" />
                    <span>
                      {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="line-clamp-2">{leave.reason}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-purple-500" />
                    <span>Submitted {new Date(leave.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      leave.status === "Approved" 
                        ? "bg-green-100 text-green-800" 
                        : leave.status === "Rejected" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors">
                      <Eye size={16} />
                      <span>Details</span>
                    </button>
                    
                    {leave.status === "Pending" && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleStatusUpdate(leave._id, "Approved")}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                        >
                          <CheckCircle size={16} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(leave._id, "Rejected")}
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
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredLeaves.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leave requests found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No emergency leave requests have been submitted yet"
            }
          </p>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Leave Management Summary</h2>
            <p className="text-orange-100">
              Currently managing {pendingLeaves} pending leave requests. Ensure timely responses to maintain medical staff workflow.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <Clock size={16} className="text-white" />
              <span className="font-semibold">{pendingLeaves} Pending</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <AlertTriangle size={16} className="text-white" />
              <span className="font-semibold">Emergency Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}