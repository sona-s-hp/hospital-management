'use client';
import { useState, useEffect } from "react";
import { 
  Scan, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye,
  Download,
  Phone,
  Mail,
  Building,
  Shield,
  FileText,
  Activity,
  Award,
  Radio
} from 'lucide-react';

export default function AdminRadiology() {
  const [radiologyCenters, setRadiologyCenters] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    hospital: "Zane Care Medical",
    licenseNumber: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRadiology();
  }, []);

  // ✅ Fetch all registered radiology centers
  const fetchRadiology = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/radiology/display");
      const data = await res.json();
      if (data.success) setRadiologyCenters(data.radiologyCenters);
    } catch (err) {
      console.error("Error fetching radiology centers:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  // ✅ Validation function
  const validateForm = () => {
    const newErrors: any = {};

    if (!form.name.trim() || form.name.length < 3)
      newErrors.name = "Name must be at least 3 characters long";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email))
      newErrors.email = "Enter a valid email address";

    if (!form.password || form.password.length < 3)
      newErrors.password = "Password must be at least 3 characters";

    const contactRegex = /^[0-9]{10}$/;
    if (!form.contact || !contactRegex.test(form.contact))
      newErrors.contact = "Enter a valid 10-digit contact number";

    if (!form.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit new radiology registration
  const handleAddRadiology = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user || !user._id) {
        setErrors({ general: "Please login again" });
        return;
      }

      const res = await fetch("/api/radiology/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user._id }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Radiology Center registered successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchRadiology();
        setForm({
          name: "",
          email: "",
          password: "",
          contact: "",
          hospital: "Zane Care Medical",
          licenseNumber: "",
        });
        setShowForm(false);
      } else {
        setErrors({ general: data.error || "Error registering radiology center" });
      }
    } catch (err) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete a radiology center
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this radiology center? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/radiology/delete/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setSuccess("Radiology Center deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchRadiology();
      } else {
        setErrors({ general: data.error || "Error deleting radiology center" });
      }
    } catch (err) {
      setErrors({ general: "Network error. Please try again." });
    }
  };

  // Filter radiology centers based on search
  const filteredCenters = radiologyCenters.filter((center: any) =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get radiology statistics
  const totalCenters = radiologyCenters.length;
  const licensedCenters = radiologyCenters.filter((center: any) => center.licenseNumber).length;
  const hospitalLinked = radiologyCenters.filter((center: any) => center.hospital && center.hospital !== "Zane Care Medical").length;

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-rose-900 bg-clip-text text-transparent">
              Radiology Centers
            </h1>
          </div>
          <p className="text-gray-600">
            Manage imaging centers and diagnostic radiology partners
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus size={20} />
            <span>Add Center</span>
          </button>
        </div>
      </div>

      {/* Radiology Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-xl">
              <Radio className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Centers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCenters}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Licensed</p>
              <p className="text-2xl font-bold text-gray-900">{licensedCenters}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hospital Linked</p>
              <p className="text-2xl font-bold text-gray-900">{hospitalLinked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {errors.general}
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

      {/* Add Radiology Center Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Register New Radiology Center</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleAddRadiology} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center Information</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Radiology Center Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                )}
                
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300 mt-4"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Shield size={14} />
                  <span>Minimum 3 characters required</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact & Licensing</label>
                <input
                  type="text"
                  name="contact"
                  placeholder="Contact Number (10 digits)"
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300"
                  required
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-2">{errors.contact}</p>
                )}
                
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="License Number"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300 mt-4"
                  required
                />
                {errors.licenseNumber && (
                  <p className="text-red-500 text-sm mt-2">{errors.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Assignment</label>
                <input
                  type="text"
                  name="hospital"
                  placeholder="Linked Hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300"
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Building size={14} />
                  <span>Leave blank for main hospital</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-end gap-4 pt-4 border-t border-gray-200">
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
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Plus size={20} />
                )}
                <span>{loading ? "Registering..." : "Register Center"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search centers by name, email, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 shadow-lg transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Radiology Centers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading radiology centers...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCenters.map((center: any) => (
            <div key={center._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Scan className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{center.name}</h3>
                    <p className="text-pink-600 font-medium">Imaging Center</p>
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
                  <span className="truncate">{center.userId?.email || "-"}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-green-500" />
                  <span>{center.contact}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} className="text-purple-500" />
                  <span className="font-mono">{center.licenseNumber || "No License"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={16} className="text-orange-500" />
                  <span>{center.hospital || "Zane Care Medical"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity size={16} className="text-green-500" />
                  <span>Active • Diagnostic Imaging</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition-colors">
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(center._id)}
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
      {filteredCenters.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Scan className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No radiology centers found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Get started by adding your first radiology center"
            }
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add First Center</span>
          </button>
        </div>
      )}
    </div>
  );
}