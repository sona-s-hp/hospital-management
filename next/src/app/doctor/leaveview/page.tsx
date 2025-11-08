"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyEmergencyLeaves() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [doctorName, setDoctorName] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }

    const fetchDoctorLeaves = async () => {
      try {
        setLoading(true);
        // Fetch doctor info
        const doctorRes = await fetch(`/api/doctor/byUser/${user._id}`);
        const doctorData = await doctorRes.json();
        if (!doctorData.success) return setError("Doctor not found");

        const doctorId = doctorData.doctor._id;
        setDoctorName(`Dr. ${doctorData.doctor.firstName} ${doctorData.doctor.lastName}`);

        // Fetch leaves of this doctor
        const res = await fetch(`/api/emergencyLeave/myLeaves/${doctorId}`);
        const data = await res.json();
        if (data.success) {
          const leavesData = data.leaves || [];
          setLeaves(leavesData);
          setFilteredLeaves(leavesData);
          
          // Calculate stats
          setStats({
            total: leavesData.length,
            approved: leavesData.filter((l: any) => l.status === "Approved").length,
            pending: leavesData.filter((l: any) => l.status === "Pending").length,
            rejected: leavesData.filter((l: any) => l.status === "Rejected").length
          });
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

    fetchDoctorLeaves();
  }, [router]);

  // Filter leaves based on status
  useEffect(() => {
    if (filter === "all") {
      setFilteredLeaves(leaves);
    } else {
      setFilteredLeaves(leaves.filter(leave => leave.status === filter));
    }
  }, [filter, leaves]);

  // Get status badge style
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  // Get leave type style
  const getLeaveTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'emergency':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'normal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'other':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate duration
  const calculateDuration = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📋 My Leave Applications
            </h1>
            <p className="text-gray-600 text-lg">
              Track and manage your leave requests
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/leave-form")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>➕</span>
              Apply New Leave
            </button>
            <button
              onClick={() => router.back()}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all duration-300 border border-purple-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
          </div>
        </div>

        {/* Doctor Info Card */}
        {doctorName && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {doctorName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{doctorName}</h2>
                <p className="text-gray-600">View your leave application history and status</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-gray-600 text-sm">Total Leaves</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.approved}</div>
                <div className="text-gray-600 text-sm">Approved</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
                <div className="text-gray-600 text-sm">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.rejected}</div>
                <div className="text-gray-600 text-sm">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Leave History {filter !== 'all' && `(${filter})`}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                      filter === status
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-semibold">Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Leaves List */}
          <div className="p-6">
            {filteredLeaves.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {leaves.length === 0 ? 'No leave applications yet' : 'No leaves match your filter'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {leaves.length === 0 
                    ? "You haven't applied for any leaves yet. Start by applying for your first leave."
                    : 'Try selecting a different filter to see more results.'
                  }
                </p>
                {leaves.length === 0 && (
                  <button
                    onClick={() => router.push("/leave-form")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium inline-flex items-center gap-2"
                  >
                    <span>➕</span>
                    Apply for Leave
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves.map((leave, index) => (
                  <div 
                    key={leave._id}
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300 bg-white"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Section - Leave Details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getLeaveTypeStyle(leave.leaveType)}`}>
                            {leave.leaveType || 'Unknown'} Leave
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(leave.status)}`}>
                            {getStatusIcon(leave.status)} {leave.status}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            📅 {calculateDuration(leave.fromDate, leave.toDate)} day{calculateDuration(leave.fromDate, leave.toDate) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {leave.reason}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">From:</span>
                            <span>{formatDate(leave.fromDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">To:</span>
                            <span>{formatDate(leave.toDate)}</span>
                          </div>
                          {leave.appliedDate && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Applied:</span>
                              <span>{formatDate(leave.appliedDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Actions/Info */}
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        {leave.status === 'Pending' && (
                          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            ⏰ Under Review
                          </button>
                        )}
                        {leave.status === 'Approved' && (
                          <div className="text-sm text-green-600 font-medium text-center">
                            ✅ Approved
                          </div>
                        )}
                        {leave.status === 'Rejected' && (
                          <div className="text-sm text-red-600 font-medium text-center">
                            ❌ Not Approved
                          </div>
                        )}
                        
                        {leave.notes && (
                          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg">
                            <strong>Note:</strong> {leave.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="font-semibold text-gray-800">Need to apply for leave?</h4>
              <p className="text-gray-600 text-sm">Submit a new leave application quickly</p>
            </div>
            <button
              onClick={() => router.push("/leave-form")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <span>➕</span>
              Apply for New Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}