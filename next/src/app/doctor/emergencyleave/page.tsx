"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeaveForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    leaveType: "",
    reason: "",
    customReason: "",
    fromDate: "",
    toDate: "",
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [doctorName, setDoctorName] = useState("");

  // ✅ Fetch doctor info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }

    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctor/byUser/${user._id}`);
        const data = await res.json();
        if (data.success) {
          setDoctorId(data.doctor._id);
          setDoctorName(`Dr. ${data.doctor.firstName} ${data.doctor.lastName}`);
        } else {
          setError("Doctor not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching doctor info.");
      }
    };

    fetchDoctor();
  }, [router]);

  // ✅ Default reasons for each leave type
  const defaultReasons: Record<string, string> = {
    Emergency: "Medical emergency or urgent situation requiring immediate leave.",
    Normal: "Planned personal leave for rest and personal commitments.",
    Other: "",
  };

  // ✅ Leave type descriptions
  const leaveTypeDescriptions: Record<string, string> = {
    Emergency: "For urgent, unplanned situations requiring immediate absence",
    Normal: "For planned personal time off with advance notice",
    Other: "For any other leave requirements not covered above"
  };

  // ✅ Handle leave type change
  const handleLeaveTypeChange = (type: string) => {
    setForm({
      ...form,
      leaveType: type,
      reason: defaultReasons[type],
      customReason: "",
    });
  };

  // ✅ Handle text field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Calculate number of days
  const calculateDays = () => {
    if (form.fromDate && form.toDate) {
      const from = new Date(form.fromDate);
      const to = new Date(form.toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return setError("Doctor info not loaded yet.");

    // Validate dates
    if (form.fromDate && form.toDate && new Date(form.fromDate) > new Date(form.toDate)) {
      return setError("End date cannot be before start date.");
    }

    const finalReason = form.leaveType === "Other" ? form.customReason : form.reason;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/emergencyLeave/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: form.leaveType,
          reason: finalReason,
          fromDate: form.fromDate,
          toDate: form.toDate,
          doctorId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Leave application submitted successfully! 🎉");
        setError(null);
        setForm({
          leaveType: "",
          reason: "",
          customReason: "",
          fromDate: "",
          toDate: "",
        });
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message || "Failed to submit leave application");
      }
    } catch (err) {
      console.error(err);
      setError("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📋 Leave Application
            </h1>
            <p className="text-gray-600 text-lg">
              Submit your leave request for review and approval
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => router.back()}
              className="flex-1 md:flex-none bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all duration-300 border border-purple-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
                <p className="text-gray-600">Submit your leave request below</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6">
                <h2 className="text-2xl font-bold text-white">Leave Request Details</h2>
                <p className="text-purple-100 mt-1">Fill in all required information</p>
              </div>

              <div className="p-6">
                {/* Status Messages */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <div className="font-semibold">Success!</div>
                      <div>{success}</div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <div className="font-semibold">Attention Required</div>
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Leave Type Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3">
                      {["Emergency", "Normal", "Other"].map((type) => (
                        <div
                          key={type}
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            form.leaveType === type
                              ? "border-purple-500 bg-purple-50 shadow-md"
                              : "border-gray-200 hover:border-purple-300 hover:bg-purple-25"
                          }`}
                          onClick={() => handleLeaveTypeChange(type)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              form.leaveType === type 
                                ? "border-purple-500 bg-purple-500" 
                                : "border-gray-300"
                            }`}>
                              {form.leaveType === type && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-800 text-lg">
                                    {type} Leave
                                  </h3>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {leaveTypeDescriptions[type]}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  type === "Emergency" 
                                    ? "bg-red-100 text-red-800" 
                                    : type === "Normal"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {type}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-filled or custom reason */}
                  {form.leaveType && form.leaveType !== "Other" && (
                    <div>
                      <label className="block font-semibold text-gray-800 mb-3">
                        Reason for Leave
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{form.reason}</p>
                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <span>💡</span>
                          Pre-filled based on leave type
                        </div>
                      </div>
                    </div>
                  )}

                  {form.leaveType === "Other" && (
                    <div>
                      <label className="block font-semibold text-gray-800 mb-3">
                        Custom Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="customReason"
                        value={form.customReason}
                        onChange={handleChange}
                        className="w-full h-32 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Please provide detailed reason for your leave request..."
                        required
                      />
                      <div className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <span>📝</span>
                        Please be specific about your leave requirements
                      </div>
                    </div>
                  )}

                  {/* Date Inputs */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-gray-800 mb-3">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fromDate"
                        value={form.fromDate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-800 mb-3">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="toDate"
                        value={form.toDate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                        min={form.fromDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Duration Display */}
                  {form.fromDate && form.toDate && calculateDays() > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600">📅</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">Leave Duration</div>
                            <div className="text-blue-600 font-medium">
                              {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          {new Date(form.fromDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })} - {new Date(form.toDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !form.leaveType || !form.fromDate || !form.toDate}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                      loading || !form.leaveType || !form.fromDate || !form.toDate
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>📨</span>
                        Submit Leave Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Information */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              {/* Information Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Application Guidelines
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    Submit leave requests at least 3 days in advance for normal leave
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    Emergency leaves require immediate notification
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    Ensure all patient responsibilities are covered
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    You'll receive confirmation within 24 hours
                  </li>
                </ul>
              </div>

              {/* Status Card */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>⏰</span>
                  Processing Time
                </h3>
                <div className="space-y-2 text-blue-100">
                  <div className="flex justify-between">
                    <span>Normal Leave:</span>
                    <span className="font-semibold">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Leave:</span>
                    <span className="font-semibold">2-4 hours</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/20 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>Contact HR for urgent queries</span>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>❓</span>
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Having trouble with your leave application?
                </p>
                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}