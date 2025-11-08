// app/pharmacy/profile/page.tsx - Enhanced
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  IdCard,
  Save,
  Edit3,
  Shield,
  Calendar,
  Pill
} from "lucide-react";

export default function PharmacyProfile() {
  const router = useRouter();
  const [pharmacist, setPharmacist] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    fetchPharmacist(user._id);
  }, []);

  async function fetchPharmacist(userId: string) {
    try {
      const res = await axios.get(`/api/pharmacy/byUser/${userId}`);
      if (res.data.success) {
        setPharmacist(res.data.pharmacist);
        setFormData(res.data.pharmacist);
      }
    } catch (err) {
      console.error("Error fetching pharmacist:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await axios.put(`/api/pharmacy/update/${pharmacist._id}`, formData);
      if (res.data.success) {
        alert("✅ Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      alert("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-green-700 mr-6 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pharmacist Profile</h1>
              <p className="text-gray-600 mt-1">Manage your professional information</p>
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
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill className="text-white" size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{formData.name || "Pharmacist"}</h2>
                <p className="text-gray-600 mb-2">Licensed Pharmacist</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <Shield className="mr-1" size={14} />
                  Verified Professional
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="mr-3" size={18} />
                  <span className="text-sm">{formData.email}</span>
                </div>
                {formData.contact && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="mr-3" size={18} />
                    <span className="text-sm">{formData.contact}</span>
                  </div>
                )}
                {formData.hospital && (
                  <div className="flex items-center text-gray-600">
                    <Building className="mr-3" size={18} />
                    <span className="text-sm">{formData.hospital}</span>
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
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    <Edit3 size={16} />
                    <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "name", label: "Full Name", icon: User, type: "text" },
                    { key: "email", label: "Email Address", icon: Mail, type: "email", disabled: true },
                    { key: "contact", label: "Contact Number", icon: Phone, type: "tel" },
                    { key: "hospital", label: "Hospital", icon: Building, type: "text" },
                    { key: "licenseNumber", label: "License Number", icon: IdCard, type: "text" },
                  ].map(({ key, label, icon: Icon, type, disabled }) => (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Icon className="mr-2" size={16} />
                        {label}
                      </label>
                      <input
                        type={type}
                        value={formData[key] || ""}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        disabled={disabled || (!isEditing && !disabled)}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                          disabled || (!isEditing && !disabled) 
                            ? "bg-gray-50 text-gray-500" 
                            : "bg-white"
                        }`}
                      />
                    </div>
                  ))}
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
                      value="Pharmacy"
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Shield className="mr-2" size={16} />
                      Role
                    </label>
                    <input
                      type="text"
                      value="Senior Pharmacist"
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                    >
                      <Save size={18} />
                      <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}