'use client';
import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye,
  Download,
  Plus,
  Building,
  Phone,
  Mail,
  Badge,
  Shield
} from 'lucide-react';

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contact: "",
    department: "",
    hospital: "Zane Care Medical",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // 🔽 Department Options
  const departmentOptions = [
    "Discharge",
    "Records", 
    "Reception",
    "Billing",
    "Nursing",
    "Pharmacy Support",
  ];

  const departmentColors: Record<string, string> = {
    "Discharge": "from-purple-500 to-indigo-500",
    "Records": "from-blue-500 to-cyan-500",
    "Reception": "from-green-500 to-emerald-500",
    "Billing": "from-orange-500 to-amber-500",
    "Nursing": "from-pink-500 to-rose-500",
    "Pharmacy Support": "from-teal-500 to-green-500",
  };

  useEffect(() => { 
    fetchStaff(); 
  }, []);

  // ✅ Fetch all staff members
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/all");
      const data = await res.json();
      if (data.success) setStaffList(data.staff);
    } catch (err) {
      setError("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update form state
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Validate form
  const validateForm = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Invalid email format.");
      return false;
    }
    if (form.password.length < 3) {
      setError("Password must be at least 3 characters long.");
      return false;
    }
    if (form.contact && !/^[0-9]{10}$/.test(form.contact)) {
      setError("Contact number must be 10 digits.");
      return false;
    }
    setError("");
    return true;
  };

  // ✅ Add Staff
  const handleAddStaff = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/staff/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        fetchStaff();
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          contact: "",
          department: "",
          hospital: "Zane Care Medical",
        });
        setError("");
        setSuccess("Staff member added successfully!");
        setShowForm(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Error adding staff");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Staff
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const res = await fetch(`/api/staff/delete/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        fetchStaff();
        setSuccess("Staff member deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to delete staff");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  // Filter staff based on search and department
  const filteredStaff = staffList.filter((staff: any) => {
    const matchesSearch = 
      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Get department stats
  const departmentStats = departmentOptions.reduce((acc, dept) => {
    acc[dept] = staffList.filter((staff: any) => staff.department === dept).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Staff Management
            </h1>
          </div>
          <p className="text-gray-600">
            Manage administrative staff and team members across all departments
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <UserPlus size={20} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {departmentOptions.map((dept) => (
          <div key={dept} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${departmentColors[dept]} mb-2`}></div>
            <p className="text-sm text-gray-600 font-medium">{dept}</p>
            <p className="text-2xl font-bold text-gray-900">{departmentStats[dept] || 0}</p>
          </div>
        ))}
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

      {/* Add Staff Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Register New Staff Member</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                    required
                  />
                  <input
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Details</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                  required
                />
                <input
                  name="contact"
                  placeholder="Contact Number"
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 mt-4"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Details</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <input
                  name="hospital"
                  placeholder="Hospital Assignment"
                  value={form.hospital}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 mt-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Create Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                  required
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Shield size={14} />
                  <span>Minimum 3 characters required</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserPlus size={20} />
                )}
                <span>{loading ? "Adding..." : "Add Staff Member"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search staff by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-lg transition-all duration-300"
            />
          </div>
          
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-lg transition-all duration-300"
          >
            <option value="all">All Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff members...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStaff.map((staff: any) => (
            <div key={staff._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${departmentColors[staff.department] || 'from-gray-500 to-gray-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">
                      {staff.firstName[0]}{staff.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge size={14} className="text-purple-500" />
                      <span className="text-purple-600 font-medium">{staff.department || "Unassigned"}</span>
                    </div>
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
                  <Mail size={16} className="text-blue-500" />
                  <span className="truncate">{staff.userId?.email}</span>
                </div>
                {staff.contact && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-green-500" />
                    <span>{staff.contact}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={16} className="text-orange-500" />
                  <span>{staff.hospital || "Zane Care Medical"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  <Eye size={16} />
                  <span>View Profile</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(staff._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredStaff.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedDepartment !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first staff member"
            }
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add First Staff Member</span>
          </button>
        </div>
      )}
    </div>
  );
}