'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Camera,
  Shield,
  Bell,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PatientProfile() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userData);
    fetchPatient(user._id);
  }, []);

  async function fetchPatient(userId: string) {
    try {
      const res = await fetch(`/api/patient/byUser/${userId}`);
      const data = await res.json();
      if (data.success) {
        setPatient(data.patient);
        setFormData(data.patient);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if ((formData.newPassword || formData.confirmPassword) && !formData.currentPassword) {
      alert("Please enter your current password to change password!");
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          password: formData.newPassword,
        }),
      };

      delete updateData.confirmPassword;
      delete updateData.newPassword;

      const res = await fetch(`/api/patient/update/${patient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Profile updated successfully!");
        if (formData.newPassword || formData.email !== patient.email) {
          alert("Please log in again with your new credentials.");
          localStorage.removeItem("user");
          router.push("/login");
        }
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <div className="w-24"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-100"
            >
              {/* Profile Card */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto">
                    {(patient?.firstName?.[0] || "P").toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {patient?.firstName} {patient?.lastName}
                </h2>
                <p className="text-gray-600 mt-1">Patient</p>
                <div className="mt-3 inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Active Account</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: "personal", icon: User, label: "Personal Info" },
                  { id: "security", icon: Shield, label: "Security" },
                  { id: "notifications", icon: Bell, label: "Notifications" },
                  { id: "billing", icon: CreditCard, label: "Billing" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold border border-blue-100 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                        activeTab === item.id ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span className="text-left">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              {activeTab === "personal" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { field: "firstName", icon: User, type: "text" },
                      { field: "lastName", icon: User, type: "text" },
                      { field: "email", icon: Mail, type: "email" },
                      { field: "phone", icon: Phone, type: "tel" },
                      { field: "gender", icon: User, type: "text" },
                      { field: "dateOfBirth", icon: Calendar, type: "date" },
                      { field: "address", icon: MapPin, type: "text", fullWidth: true },
                    ].map(({ field, icon: Icon, type, fullWidth }) => (
                      <div key={field} className={fullWidth ? "md:col-span-2" : ""}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span>{field.replace(/([A-Z])/g, " $1")}</span>
                        </label>
                        <div className="relative">
                          <input
                            type={type}
                            value={formData[field] || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, [field]: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                            placeholder={`Enter your ${field.replace(
                              /([A-Z])/g,
                              " $1"
                            ).toLowerCase()}`}
                          />
                          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Security Settings
                  </h3>
                  <div className="space-y-6">
                    {/* Current Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={formData.currentPassword || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-9 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={formData.newPassword || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-9 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={formData.confirmPassword || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-9 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Bell className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Notification Settings
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Notification preferences will be available soon.
                  </p>
                </div>
              )}

              {activeTab === "billing" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Billing Information
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Billing management will be available soon.
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end border-t pt-6">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
