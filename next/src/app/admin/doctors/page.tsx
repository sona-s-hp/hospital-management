'use client';
import { useState, useEffect } from "react";
import { 
  Stethoscope, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye,
  Download,
  Plus,
  Users,
  BadgeCheck
} from 'lucide-react';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    department: "",
    contact: "",
    hospital: "Zane Care Medical"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // 🔽 Departments based on specialization
  const departmentOptions: Record<string, string[]> = {
    "Orthopedic Surgeon": ["Bone & Joint", "Trauma Care", "Sports Injury"],
    "Cardiologist": ["Cardiology", "Heart Failure", "Cardiac Surgery"],
    "Gynecologist": ["Obstetrics", "Fertility", "Maternity"],
    "Neurologist": ["Neurology", "Neurosurgery", "Stroke Unit"],
    "Pediatrician": ["Child Care", "Neonatology", "Immunization"],
    "Vaccination Specialist": ["Immunization", "Travel Vaccination", "Adult Vaccination", "Child Vaccination", "Preventive Health"],
  };

  const specializations = [
    "Orthopedic Surgeon",
    "Cardiologist", 
    "Gynecologist",
    "Neurologist",
    "Pediatrician",
    "Vaccination Specialist"
  ];

  useEffect(() => { 
    fetchDoctors(); 
  }, []);

  // ✅ Fetch all doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/all");
      const data = await res.json();
      if (data.success) setDoctors(data.doctors);
    } catch (err) {
      setError("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update form state
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // Reset department if specialization changes
    if (name === "specialization") {
      setForm((prev) => ({ ...prev, [name]: value, department: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Validate fields before submit
  const validateForm = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.specialization || !form.department) {
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

  // ✅ Add doctor to database
  const handleAddDoctor = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    // Apply default hospital if empty
    const doctorData = { ...form, hospital: form.hospital || "Zane Care Medical" };

    try {
      const res = await fetch("/api/doctor/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorData),
      });

      const data = await res.json();
      if (data.success) {
        fetchDoctors();
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          specialization: "",
          department: "",
          contact: "",
          hospital: "Zane Care Medical"
        });
        setError("");
        setSuccess("Doctor added successfully!");
        setShowForm(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Error adding doctor");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete doctor handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`/api/doctor/delete/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        fetchDoctors();
        setSuccess("Doctor deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to delete doctor");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  // Filter doctors based on search
  const filteredDoctors = doctors.filter((doctor: any) =>
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
              Medical Doctors
            </h1>
          </div>
          <p className="text-gray-600">
            Manage and oversee all medical practitioners at Zane Care Medical
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <UserPlus size={20} />
            <span>Add Doctor</span>
          </button>
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

      {/* Add Doctor Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Register New Doctor</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300"
                    required
                  />
                  <input
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300"
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300"
                  required
                />
                <input
                  name="contact"
                  placeholder="Contact Number"
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300 mt-4"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Details</label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300"
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300 mt-4"
                  required
                  disabled={!form.specialization}
                >
                  <option value="">
                    {form.specialization ? "Select Department" : "Select specialization first"}
                  </option>
                  {form.specialization &&
                    departmentOptions[form.specialization].map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Create Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300"
                  required
                />
                <input
                  name="hospital"
                  placeholder="Hospital Assignment"
                  value={form.hospital}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300 mt-4"
                />
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
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserPlus size={20} />
                )}
                <span>{loading ? "Adding..." : "Add Doctor"}</span>
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
            placeholder="Search doctors by name, specialization, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 shadow-lg transition-all duration-300"
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

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor: any) => (
            <div key={doctor._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {doctor.firstName[0]}{doctor.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-green-600 font-medium">{doctor.specialization}</p>
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
                  <BadgeCheck size={16} className="text-green-500" />
                  <span>{doctor.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-blue-500" />
                  <span>{doctor.hospital || "Zane Care Medical"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📧</span>
                  <span className="truncate">{doctor.email}</span>
                </div>
                {doctor.contact && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞</span>
                    <span>{doctor.contact}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors">
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(doctor._id)}
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
      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first doctor"}
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add First Doctor</span>
          </button>
        </div>
      )}
    </div>
  );
}