'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Star,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

export default function AppointmentBooking() {
  const router = useRouter();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpec, setSelectedSpec] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<{ time: string; booked: boolean }[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  // ✅ Get user info
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ✅ Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/doctor/all");
        const data = await res.json();
        if (data.success) {
          const specs = [...new Set(data.doctors.map((d: any) => d.specialization))];
          setSpecializations(specs);
          setDoctors(data.doctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ Time slots 9 AM - 5 PM
  const generateSlots = () => {
    const times: string[] = [];
    let start = 9 * 60; // 9 AM
    let end = 17 * 60;  // 5 PM
    while (start < end) {
      const hour = Math.floor(start / 60);
      const minute = start % 60;
      const time = `${hour}:${minute === 0 ? "00" : minute}`;
      times.push(time);
      start += 30; // 30-minute intervals
    }
    return times;
  };

  // ✅ Fetch booked slots
  const fetchBookedSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;

    const formattedDate = new Date(date).toISOString().split("T")[0];
    setLoading(true);

    try {
      const res = await fetch(`/api/appointment?doctorId=${doctorId}&date=${formattedDate}`);
      const data = await res.json();

      const allSlots = generateSlots().map((time) => ({
        time,
        booked: data.bookedSlots?.includes(time),
      }));
      setSlots(allSlots);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle doctor selection
  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setBookingStep(3); // Move to date selection step
  };

  // ✅ Book slot
  const handleBook = async (time: string) => {
    if (!user || !selectedDoctor || !selectedDate)
      return alert("Select doctor and date first");

    setLoading(true);
    const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user._id,
          doctorId: selectedDoctor._id,
          date: formattedDate,
          time,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedSlot(time);
        setBookingStep(4); // Move to confirmation step
      } else {
        alert(data.message || "Error booking slot");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress steps
  const steps = [
    { number: 1, title: "Specialization", active: bookingStep >= 1 },
    { number: 2, title: "Doctor", active: bookingStep >= 2 },
    { number: 3, title: "Date & Time", active: bookingStep >= 3 },
    { number: 4, title: "Confirmation", active: bookingStep >= 4 },
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
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
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
                  } -z-10`} style={{ left: `${(index * 33) + 16.5}%` }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Specialization Selection */}
        {bookingStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <Stethoscope className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Specialization</h2>
              <p className="text-gray-600">Select the medical specialization you need</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <select
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                  value={selectedSpec}
                  onChange={(e) => {
                    setSelectedSpec(e.target.value);
                    if (e.target.value) setBookingStep(2);
                  }}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Doctor Selection */}
        {bookingStep === 2 && selectedSpec && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Doctor</h2>
                <p className="text-gray-600">Choose from available {selectedSpec} specialists</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSpec("");
                  setBookingStep(1);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Change Specialization
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors
                  .filter((d) => d.specialization === selectedSpec)
                  .map((doc) => (
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
                            <span className="text-sm text-gray-600">4.8 (120 reviews)</span>
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
          </motion.div>
        )}

        {/* Step 3: Date & Time Selection */}
        {bookingStep === 3 && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
                <p className="text-gray-600">
                  Booking with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setSelectedDate("");
                  setSelectedSlot("");
                  setBookingStep(2);
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
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchBookedSlots(selectedDoctor._id, e.target.value);
                  }}
                />
                {selectedDate && (
                  <p className="text-sm text-gray-600 mt-3">
                    Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
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
                  Available Time Slots
                </h3>
                
                {!selectedDate ? (
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
                      {slots.map(({ time, booked }) => {
                        const isMine = selectedSlot === time;
                        return (
                          <motion.button
                            key={time}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: booked ? 1 : 1.05 }}
                            whileTap={{ scale: booked ? 1 : 0.95 }}
                            onClick={() => !booked && handleBook(time)}
                            disabled={booked && !isMine}
                            className={`p-3 rounded-xl font-semibold transition-all ${
                              booked
                                ? isMine
                                  ? "bg-green-500 text-white shadow-md"
                                  : "bg-red-100 text-red-600 cursor-not-allowed"
                                : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              {booked && !isMine && <XCircle className="h-4 w-4" />}
                              {isMine && <CheckCircle className="h-4 w-4" />}
                              <span>{time}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {bookingStep === 4 && (
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
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-semibold">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-semibold">{selectedDoctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
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
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setSelectedSpec("");
                    setSelectedDoctor(null);
                    setSelectedDate("");
                    setSelectedSlot("");
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
      </div>
    </div>
  );
}