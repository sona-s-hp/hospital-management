'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from "lucide-react";

type Doctor = {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  hospital: string;
  experience: number;
  rating: number;
};

type TeleconsultRequest = {
  _id: string;
  doctor?: Doctor | null;
  date: string;
  time?: string;
  status: string;
  mode: string;
  meetingLink?: string;
};

export default function TeleconsultationBooking() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [mode, setMode] = useState<string>("Video");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequests, setSubmittedRequests] = useState<TeleconsultRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  // ✅ Get logged-in user
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ✅ Fetch patient details
  useEffect(() => {
    if (!user?._id) return;
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patient/byUser/${user._id}`);
        const data = await res.json();
        if (data.success) setPatientId(data.patient._id);
        else setError(data.message || "Patient not found");
      } catch {
        setError("Failed to fetch patient info");
      }
    };
    fetchPatient();
  }, [user]);

  // ✅ Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/doctor/all");
        const data = await res.json();
        if (data.success) setDoctors(data.doctors);
      } catch {
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ Generate slots between 7 PM and 9 PM
  const generateSlots = () => {
    const slots: string[] = [];
    const start = 19 * 60; // 7 PM
    const end = 21 * 60;   // 9 PM
    for (let m = start; m < end; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    }
    return slots;
  };

  // ✅ Fetch submitted teleconsultations
  useEffect(() => {
    if (!patientId) return;
    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/teleconsultation/patient/${patientId}`);
        const data = await res.json();
        if (data.success) setSubmittedRequests(data.requests);
      } catch {
        setError("Failed to fetch consultations");
      }
    };
    fetchRequests();
  }, [patientId]);

  // ✅ Update available slots
  useEffect(() => {
    if (!patientId || !date) return;

    const fetchBookedSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teleconsultation/patient/${patientId}`);
        const data = await res.json();
        if (data.success) {
          const booked = data.requests
            .filter((r: any) => r.date.split("T")[0] === date)
            .map((r: any) => r.time);
          const slots = generateSlots();
          setAvailableSlots(slots.filter((s) => !booked.includes(s)));
          setSelectedSlot(null);
        }
      } catch {
        setError("Failed to fetch booked slots");
      } finally {
        setLoading(false);
      }
    };
    fetchBookedSlots();
  }, [date, patientId]);

  // ✅ Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(2);
  };

  // ✅ Submit request
  const handleSubmit = async () => {
    setSuccess(null);
    setError(null);
    if (!selectedDoctor || !date || !selectedSlot) {
      return setError("Please select doctor, date, and time slot");
    }
    if (!patientId) return setError("Patient info missing");

    setLoading(true);
    try {
      const res = await fetch("/api/teleconsultation/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId: selectedDoctor._id,
          date,
          time: selectedSlot,
          mode,
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setSuccess("✅ Teleconsultation booked successfully!");
        setSubmittedRequests([data.request, ...submittedRequests]);
        setSelectedDoctor(null);
        setSelectedSpec("");
        setDate("");
        setSelectedSlot(null);
        setBookingStep(3);
      } else {
        setError(data.message || "Failed to book consultation");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));
  const filteredDoctors = selectedSpec
    ? doctors.filter((d) => d.specialization === selectedSpec)
    : [];

  // Progress steps
  const steps = [
    { number: 1, title: "Doctor", active: bookingStep >= 1 },
    { number: 2, title: "Schedule", active: bookingStep >= 2 },
    { number: 3, title: "Confirmation", active: bookingStep >= 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Consultation</h1>
          <div className="w-24"></div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  step.active 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white border-gray-300 text-gray-400"
                } font-semibold transition-all duration-300 z-10`}>
                  {step.active ? <CheckCircle className="h-6 w-6" /> : step.number}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  step.active ? "text-blue-600" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    step.active ? "bg-blue-600" : "bg-gray-300"
                  } -z-10`} style={{ left: `${(index * 50) + 25}%` }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Doctor Selection */}
        {bookingStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <Video className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Doctor</h2>
              <p className="text-gray-600">Select a specialist for your virtual consultation</p>
            </div>

            {/* Specialization & Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Mode
                </label>
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="Video">Video Consultation</option>
                  <option value="Audio">Audio Consultation</option>
                </select>
              </div>
            </div>

            {/* Doctor List */}
            {selectedSpec && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Available {selectedSpec} Specialists
                </h3>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doc) => (
                      <motion.div
                        key={doc._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                          selectedDoctor?._id === doc._id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                        onClick={() => handleDoctorSelect(doc)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {doc.firstName[0]}{doc.lastName[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">
                              Dr. {doc.firstName} {doc.lastName}
                            </h3>
                            <p className="text-blue-600 font-medium">{doc.specialization}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{doc.hospital}</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">
                                {doc.rating || 4.8} ({doc.experence || 5}+ years)
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                          onClick={() => handleDoctorSelect(doc)}
                        >
                          Select Doctor
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Schedule Consultation */}
        {bookingStep === 2 && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Schedule Consultation</h2>
                <p className="text-gray-600">
                  With Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setBookingStep(1);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Change Doctor
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Select Date
                </h3>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {date && (
                  <p className="text-sm text-gray-600 mt-3">
                    Selected: {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>

              {/* Time Slots */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  Available Time Slots (7 PM - 9 PM)
                </h3>
                
                {!date ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Please select a date first</p>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {generateSlots().map((slot) => {
                        const isAvailable = availableSlots.includes(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <motion.button
                            key={slot}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                            whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                            onClick={() => isAvailable && setSelectedSlot(slot)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-xl font-semibold transition-all ${
                              !isAvailable
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : isSelected
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              {!isAvailable && <XCircle className="h-4 w-4" />}
                              {isSelected && <CheckCircle className="h-4 w-4" />}
                              <span>{slot}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedSlot || loading}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    <span>Confirm Teleconsultation</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {bookingStep === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Consultation Booked!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your virtual consultation has been scheduled successfully. You'll receive a confirmation email with the meeting details.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/patient/dashboard')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setSelectedSpec("");
                    setSelectedDoctor(null);
                    setDate("");
                    setSelectedSlot(null);
                    setBookingStep(1);
                  }}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  Book Another
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Submitted Consultations */}
        {submittedRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Consultations</h2>
            <div className="space-y-4">
              {submittedRequests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
                        {request.mode === "Video" ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {request.doctor ? `Dr. ${request.doctor.firstName} ${request.doctor.lastName}` : "Doctor Not Assigned"}
                        </h3>
                        <p className="text-gray-600">{request.doctor?.specialization}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(request.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{request.time}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            request.mode === "Video" 
                              ? "bg-purple-100 text-purple-700" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {request.mode}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {request.meetingLink && (
                        <a
                          href={request.meetingLink}
                          target="_blank"
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Join Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}