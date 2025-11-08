'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function DoctorProfile() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    fetchDoctor(user._id);
  }, [router]);

  async function fetchDoctor(userId: string) {
    try {
      const res = await axios.get(`/api/doctor/byUser/${userId}`);
      if (res.data.success) {
        setDoctor(res.data.doctor);
        setFormData(res.data.doctor);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await axios.put(`/api/doctor/update/${doctor._id}`, formData);
      if (res.data.success) {
        setSuccess(true);
        setDoctor(formData);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(doctor);
    setError(null);
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(doctor);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              👨‍⚕️ Doctor Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your professional information and settings
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all duration-300 border border-purple-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 sticky top-8"
            >
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Dr. {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-purple-600 font-medium mt-1">
                  {formData.specialization}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {formData.department}
                </p>
              </div>

              {/* Profile Stats */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">📧</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {formData.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">📞</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Contact</div>
                      <div className="font-medium text-gray-800">
                        {formData.contact || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600">🏥</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Department</div>
                      <div className="font-medium text-gray-800">
                        {formData.department || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                  <span>🔄</span>
                  Reset Password
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                  <span>📋</span>
                  View Schedule
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
            >
              {/* Form Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6">
                <h2 className="text-2xl font-bold text-white">Edit Profile Information</h2>
                <p className="text-purple-100 mt-1">
                  Update your professional details and contact information
                </p>
              </div>

              <div className="p-6">
                {/* Status Messages */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <div className="font-semibold">Success!</div>
                      <div>Your profile has been updated successfully.</div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <div className="font-semibold">Error</div>
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { field: "firstName", label: "First Name", type: "text", required: true },
                    { field: "lastName", label: "Last Name", type: "text", required: true },
                    { field: "email", label: "Email Address", type: "email", disabled: true },
                    { field: "specialization", label: "Specialization", type: "text", required: true },
                    { field: "department", label: "Department", type: "text", required: true },
                    { field: "contact", label: "Contact Number", type: "tel", required: false },
                    { field: "licenseNumber", label: "License Number", type: "text", required: false },
                    { field: "yearsOfExperience", label: "Years of Experience", type: "number", required: false },
                  ].map(({ field, label, type, required, disabled }) => (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={type}
                        value={formData[field] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        disabled={disabled}
                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "hover:border-gray-400"
                        }`}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </div>
                  ))}

                  {/* Biography Textarea */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Professional Biography
                    </label>
                    <textarea
                      value={formData.biography || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, biography: e.target.value })
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 resize-none"
                      placeholder="Describe your professional background, expertise, and experience..."
                    />
                    <p className="text-sm text-gray-500">
                      This will be visible to patients and colleagues.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    disabled={!hasChanges || saving}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>↶</span>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      !hasChanges || saving
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                {/* Changes Indicator */}
                {hasChanges && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-2 text-yellow-800 text-sm">
                      <span>💡</span>
                      You have unsaved changes. Don't forget to save your updates.
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Additional Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-white rounded-2xl shadow-lg border border-purple-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔒</span>
                Account Security
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">🔑</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Password</div>
                      <div className="text-sm text-gray-600">Last changed 2 weeks ago</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">📧</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Email Verified</div>
                      <div className="text-sm text-gray-600">Verified on signup</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}