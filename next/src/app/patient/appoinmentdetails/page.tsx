'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Stethoscope,
  XCircle,
  CheckCircle,
  AlertCircle,
  Download,
  Phone,
  Video
} from "lucide-react";

export default function AppointmentDetails() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id) {
        router.push("/login");
        return;
      }

      try {
        const patRes = await fetch(`/api/patient/byUser/${user._id}`);
        const patData = await patRes.json();
        if (!patData.success || !patData.patient) {
          setLoading(false);
          return;
        }

        const patientId = patData.patient._id;
        const apptRes = await fetch(`/api/appointment/patient/${patientId}`);
        const apptData = await apptRes.json();

        if (apptData.success) {
          setAppointments(apptData.appointments);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`/api/appointment/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        alert("Appointment cancelled successfully!");
        setAppointments(appointments.filter((a) => a._id !== id));
      } else {
        alert("Failed to cancel appointment.");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Server error while cancelling.");
    }
  };

  const handleJoinCall = (appt: any) => {
    // Simulate joining a call - replace with actual video call integration
    alert(`Joining video call with Dr. ${appt.doctorId?.firstName} ${appt.doctorId?.lastName}`);
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter === "all") return true;
    if (filter === "upcoming") return new Date(appt.date) >= new Date();
    if (filter === "past") return new Date(appt.date) < new Date();
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <div className="w-24"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => new Date(a.date) >= new Date()).length}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => new Date(a.date) < new Date()).length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 w-fit">
            {["all", "upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {filteredAppointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600 mb-6">You don't have any {filter !== 'all' ? filter : ''} appointments scheduled.</p>
              <button
                onClick={() => router.push('/patient/appoinments')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Book New Appointment
              </button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredAppointments.map((appt, index) => (
                <motion.div
                  key={appt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Doctor Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {appt.doctorId?.firstName?.[0]}{appt.doctorId?.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          Dr. {appt.doctorId?.firstName} {appt.doctorId?.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium">{appt.doctorId?.specialization}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{appt.doctorId?.hospital || "HealthPlus Hospital"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Stethoscope className="h-4 w-4" />
                            <span>{appt.doctorId?.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {new Date(appt.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{appt.time}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          new Date(appt.date) >= new Date() 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {new Date(appt.date) >= new Date() ? "Upcoming" : "Completed"}
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Confirmed
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {new Date(appt.date) >= new Date() && (
                        <>
                          <button
                            onClick={() => handleJoinCall(appt)}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                          >
                            <Video className="h-4 w-4" />
                            <span>Join Call</span>
                          </button>
                          <button
                            onClick={() => handleCancel(appt._id)}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      {new Date(appt.date) < new Date() && (
                        <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors">
                          <Download className="h-4 w-4" />
                          <span>Download Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}