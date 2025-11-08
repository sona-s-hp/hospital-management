// app/lab/profile/page.tsx - Fixed Version
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  Save,
  Edit3,
  Shield,
  Calendar,
  Beaker
} from "lucide-react";

export default function LabProfile() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    labName: "", 
    email: "", 
    contact: "", 
    address: "",
    licenseNumber: "",
    accreditation: ""
  });
  const [labUser, setLabUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }
    setLabUser(user);
    fetchLabDetails(user._id);
  }, []);

  const fetchLabDetails = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lab/user/${userId}`);
      const data = await res.json();
      if (data.success) setForm(data.lab);
    } catch (err) {
      console.error("Error fetching lab details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/lab/update/${labUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully ✅");
        setIsEditing(false);
      } else {
        alert("❌ Update failed");
      }
    } catch (err) {
      alert("❌ Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-blue-700 mr-6 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Laboratory Profile</h1>
              <p className="text-gray-600 mt-1">Manage your laboratory information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Beaker className="text-white" size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{form.labName || "Laboratory"}</h2>
                <p className="text-gray-600 mb-2">Diagnostic Laboratory</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <Shield className="mr-1" size={14} />
                  Accredited
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="mr-3" size={18} />
                  <span className="text-sm">{form.email}</span>
                </div>
                {form.contact && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="mr-3" size={18} />
                    <span className="text-sm">{form.contact}</span>
                  </div>
                )}
                {form.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-3" size={18} />
                    <span className="text-sm">{form.address}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Laboratory Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Edit3 size={16} />
                    <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdate} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "labName", label: "Laboratory Name", icon: Building, type: "text" },
                    { key: "email", label: "Email Address", icon: Mail, type: "email", disabled: true },
                    { key: "contact", label: "Contact Number", icon: Phone, type: "tel" },
                    { key: "licenseNumber", label: "License Number", icon: Shield, type: "text" },
                    { key: "accreditation", label: "Accreditation", icon: Calendar, type: "text" },
                  ].map(({ key, label, icon: Icon, type, disabled }) => (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Icon className="mr-2" size={16} />
                        {label}
                      </label>
                      <input
                        type={type}
                        name={key}
                        value={form[key as keyof typeof form] || ""}
                        onChange={handleChange}
                        disabled={disabled || (!isEditing && !disabled)}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          disabled || (!isEditing && !disabled) 
                            ? "bg-gray-50 text-gray-500" 
                            : "bg-white"
                        }`}
                      />
                    </div>
                  ))}
                  
                  {/* Address Field */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin className="mr-2" size={16} />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        !isEditing ? "bg-gray-50 text-gray-500" : "bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="mr-2" size={16} />
                      Department
                    </label>
                    <input
                      type="text"
                      value="Diagnostic Laboratory"
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Shield className="mr-2" size={16} />
                      Facility Type
                    </label>
                    <input
                      type="text"
                      value="Full-Service Diagnostic"
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                    >
                      <Save size={18} />
                      <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}