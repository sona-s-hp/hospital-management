'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Syringe, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  AlertCircle
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

type VaccinationRequest = {
  _id: string;
  vaccineType: string;
  doctor?: Doctor | null;
  date: string;
  time?: string;
  status: string;
};

export default function VaccinationRequestForm() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [vaccineType, setVaccineType] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [submittedRequests, setSubmittedRequests] = useState<VaccinationRequest[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  const vaccineOptions = [
    { value: "COVID-19", label: "COVID-19 Vaccine", description: "Protection against coronavirus" },
    { value: "Hepatitis B", label: "Hepatitis B", description: "Liver infection prevention" },
    { value: "Tetanus", label: "Tetanus Shot", description: "Protection against bacterial infection" },
    { value: "Influenza", label: "Flu Vaccine", description: "Seasonal influenza protection" },
    { value: "MMR", label: "MMR Vaccine", description: "Measles, Mumps, Rubella" },
    { value: "HPV", label: "HPV Vaccine", description: "Human papillomavirus prevention" },
    { value: "Pneumococcal", label: "Pneumococcal", description: "Pneumonia prevention" },
    { value: "Shingles", label: "Shingles Vaccine", description: "Herpes zoster prevention" }
  ];

  // ✅ Get logged-in user
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ✅ Fetch patient document
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

  // ✅ Fetch all doctors
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

  // ✅ Generate 15-min slots between 2 PM and 4 PM
  const generateSlots = () => {
    const slots: string[] = [];
    const start = 14 * 60; // 2 PM
    const end = 16 * 60;   // 4 PM
    for (let m = start; m < end; m += 15) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${h}:${min.toString().padStart(2, "0")}`);
    }
    return slots;
  };

  // ✅ Fetch submitted requests for this patient
  useEffect(() => {
    if (!patientId) return;

    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/vaccination/patient/${patientId}`);
        const data = await res.json();
        if (data.success) setSubmittedRequests(data.requests);
      } catch {
        setError("Failed to fetch submitted requests");
      }
    };
    fetchRequests();
  }, [patientId]);

  // ✅ Update available slots when date changes
  useEffect(() => {
    if (!patientId || !date) return;

    const fetchBookedSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vaccination/patient/${patientId}`);
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
    if (!vaccineType || !date || !selectedDoctor || !selectedSlot) {
      return setError("Please select vaccine, doctor, date, and time slot");
    }
    if (!patientId) return setError("Patient info missing");

    setLoading(true);
    try {
      const res = await fetch("/api/vaccination/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          vaccineType,
          doctorId: selectedDoctor._id,
          date,
          time: selectedSlot,
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setSuccess("✅ Vaccination request submitted successfully!");
        setSubmittedRequests([data.request, ...submittedRequests]);
        setVaccineType("");
        setSelectedSpec("");
        setSelectedDoctor(null);
        setDate("");
        setSelectedSlot(null);
        setBookingStep(3);
      } else {
        setError(data.message || "Failed to submit request");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors by specialization
  const filteredDoctors = selectedSpec
    ? doctors.filter((d) => d.specialization === selectedSpec)
    : [];

  const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));

  // Progress steps
  const steps = [
    { number: 1, title: "Vaccine & Doctor", active: bookingStep >= 1 },
    { number: 2, title: "Schedule", active: bookingStep >= 2 },
    { number: 3, title: "Confirmation", active: bookingStep >= 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Vaccination Appointment</h1>
          <div className="w-24"></div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  step.active 
                    ? "bg-green-600 border-green-600 text-white" 
                    : "bg-white border-gray-300 text-gray-400"
                } font-semibold transition-all duration-300 z-10`}>
                  {step.active ? <CheckCircle className="h-6 w-6" /> : step.number}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  step.active ? "text-green-600" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    step.active ? "bg-green-600" : "bg-gray-300"
                  } -z-10`} style={{ left: `${(index * 50) + 25}%` }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Vaccine & Doctor Selection */}
        {bookingStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <Syringe className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Vaccine & Doctor</h2>
              <p className="text-gray-600">Select the vaccine you need and choose a specialist</p>
            </div>

            {/* Vaccine & Specialization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Vaccine Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  Select Vaccine
                </h3>
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  value={vaccineType}
                  onChange={(e) => setVaccineType(e.target.value)}
                >
                  <option value="">Choose a vaccine</option>
                  {vaccineOptions.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
                {vaccineType && (
                  <p className="text-sm text-gray-600 mt-3">
                    {vaccineOptions.find(v => v.value === vaccineType)?.description}
                  </p>
                )}
              </div>

              {/* Specialization Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 text-green-600 mr-2" />
                  Doctor Specialization
                </h3>
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor List */}
            {selectedSpec && vaccineType && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Available {selectedSpec} Specialists
                </h3>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
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
                            ? "border-green-500 bg-green-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-green-300"
                        }`}
                        onClick={() => handleDoctorSelect(doc)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {doc.firstName[0]}{doc.lastName[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">
                              Dr. {doc.firstName} {doc.lastName}
                            </h3>
                            <p className="text-green-600 font-medium">{doc.specialization}</p>
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
                          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
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

        {/* Step 2: Schedule Vaccination */}
        {bookingStep === 2 && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Schedule Vaccination</h2>
                <p className="text-gray-600">
                  {vaccineType} with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setBookingStep(1);
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Change Doctor
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  Select Date
                </h3>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  Available Time Slots (2 PM - 4 PM)
                </h3>
                
                {!date ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Please select a date first</p>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
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
                                  ? "bg-green-600 text-white shadow-md"
                                  : "bg-white text-green-600 border-2 border-green-200 hover:border-green-500 hover:bg-green-50"
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

            {/* Vaccine Info Card */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {vaccineOptions.find(v => v.value === vaccineType)?.label}
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {vaccineOptions.find(v => v.value === vaccineType)?.description}
                  </p>
                  <p className="text-blue-600 text-xs mt-2">
                    💡 Please bring your ID and any previous vaccination records.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedSlot || loading}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Syringe className="h-5 w-5" />
                    <span>Confirm Vaccination Appointment</span>
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
                Appointment Confirmed!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your vaccination appointment has been scheduled successfully. You'll receive a confirmation email with the details.
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vaccine:</span>
                    <span className="font-semibold">
                      {vaccineOptions.find(v => v.value === vaccineType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-semibold">
                      Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">{selectedSlot}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/patient/dashboard')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setVaccineType("");
                    setSelectedSpec("");
                    setSelectedDoctor(null);
                    setDate("");
                    setSelectedSlot(null);
                    setBookingStep(1);
                  }}
                  className="flex-1 border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
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

        {/* Submitted Requests */}
        {submittedRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Vaccination Appointments</h2>
            <div className="space-y-4">
              {submittedRequests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white">
                        <Syringe className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{request.vaccineType}</h3>
                        <p className="text-gray-600">
                          {request.doctor ? `Dr. ${request.doctor.firstName} ${request.doctor.lastName}` : "Doctor Not Assigned"}
                        </p>
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
                            request.status === "Completed" 
                              ? "bg-green-100 text-green-700" 
                              : request.status === "Scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {request.status}
                          </div>
                        </div>
                      </div>
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