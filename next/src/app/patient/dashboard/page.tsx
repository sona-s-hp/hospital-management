'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Calendar, 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  Video, 
  LogOut,
  Bell,
  Settings,
  Activity,
  Heart,
  Clock,
  ArrowRight,
  Star,
  Home,
  ClipboardList,
  Eye,
  Download,
  CreditCard,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function PatientHome() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showText, setShowText] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState(3);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dischargeSummaries, setDischargeSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const images = [
    "/images/patienthome.avif",
    "/images/patienthome1.jpg",
    "/images/patienthome2.jpg",
  ];

  const quotes = [
    "Your health is your greatest wealth. Prioritize it today.",
    "Healing begins with a positive mind and proactive care.",
    "We care for you like family - always here when you need us.",
    "Trust, compassion, and care — our promise to you every day.",
    "Every step towards health is a step towards happiness.",
  ];

  const trustMessage = "Together, we build trust, compassion, and better health.";

  const [vacText, setVacText] = useState("");
  const fullVacText = "Vaccinations are your shield against preventable diseases. Ensure your health and your loved ones' well-being.";

  // Stats data
  const stats = [
    { icon: Calendar, label: "Upcoming Appointments", value: "2", color: "blue" },
    { icon: FileText, label: "Medical Reports", value: "5", color: "green" },
    { icon: Activity, label: "Health Score", value: "92%", color: "purple" },
    { icon: Clock, label: "Pending Actions", value: "3", color: "orange" },
  ];

  // Quick actions
  const quickActions = [
    { 
      icon: Calendar, 
      label: "Book Appointment", 
      description: "Schedule with specialists",
      color: "from-blue-500 to-blue-600",
      path: "/patient/appoinments"
    },
    { 
      icon: Video, 
      label: "Teleconsultation", 
      description: "Virtual doctor visits",
      color: "from-purple-500 to-purple-600",
      path: "/patient/teleconsultation"
    },
    { 
      icon: Shield, 
      label: "Vaccination", 
      description: "Schedule vaccinations",
      color: "from-green-500 to-green-600",
      path: "/patient/vaccination"
    },
    { 
      icon: FileText, 
      label: "Medical Records", 
      description: "View your reports",
      color: "from-orange-500 to-orange-600",
      path: "/patient/prescription"
    },
  ];

  // Navigation tabs with proper routing
  const navigationTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/patient/dashboard" },
    { id: "appointments", label: "Appointments", icon: Calendar, path: "/patient/appoinmentdetails" },
    { id: "records", label: "Records", icon: ClipboardList, path: "/patient/prescription" },
    { id: "profile", label: "Profile", icon: User, path: "/patient/profile" },
  ];

  // Recent activities
  const recentActivities = [
    { type: "appointment", text: "Appointment with Dr. Smith confirmed", time: "2 hours ago" },
    { type: "prescription", text: "New prescription available", time: "1 day ago" },
    { type: "lab", text: "Lab results are ready", time: "2 days ago" },
  ];

  // Handle navigation
  const handleNavigation = (tab: any) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  // Fetch patient details and data
  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(userData);
      setPatient(user);

      try {
        // Fetch patient appointments
        const patRes = await fetch(`/api/patient/byUser/${user._id}`);
        const patData = await patRes.json();
        
        if (patData.success && patData.patient) {
          const patientId = patData.patient._id;
          
          // Fetch appointments
          const apptRes = await fetch(`/api/appointment/patient/${patientId}`);
          const apptData = await apptRes.json();
          if (apptData.success) {
            setAppointments(apptData.appointments.slice(0, 3)); // Show only 3 latest
          }

          // Fetch discharge summaries (mock data for now)
          const mockDischargeSummaries = [
            {
              _id: "1",
              doctorName: "Dr. Sarah Johnson",
              specialization: "Cardiology",
              date: "2024-01-15",
              billing: { totalAmount: 2500 },
              paymentStatus: "Paid",
              paymentRequested: true
            },
            {
              _id: "2",
              doctorName: "Dr. Michael Brown",
              specialization: "Orthopedics",
              date: "2024-01-10",
              billing: { totalAmount: 1800 },
              paymentStatus: "Pending",
              paymentRequested: true
            }
          ];
          setDischargeSummaries(mockDischargeSummaries);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Background carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Typing animations
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setShowText(trustMessage.slice(0, i + 1));
      i++;
      if (i >= trustMessage.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [trustMessage]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setVacText(fullVacText.slice(0, i + 1));
      i++;
      if (i >= fullVacText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      const res = await fetch(`/api/appointment/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        alert("Appointment cancelled successfully!");
        setAppointments(appointments.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  const handlePayment = async (summary: any) => {
    const confirmed = confirm(`Pay ₹${summary.billing.totalAmount}?`);
    if (!confirmed) return;

    // Simulate payment
    setTimeout(() => {
      alert("Payment successful!");
      setDischargeSummaries(prev => 
        prev.map(s => s._id === summary._id ? {...s, paymentStatus: "Paid"} : s)
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Enhanced Navbar */}
      <nav className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthPlus</h1>
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100/80 rounded-2xl p-1">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleNavigation(tab)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* User Menu & Notifications */}
            {patient && (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bell className="h-6 w-6" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Settings */}
                <button 
                  onClick={() => router.push("/patient/profile")}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Settings className="h-6 w-6" />
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Welcome,{" "}
                      <span className="text-blue-600">
                        {patient.firstName || patient.email}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">Patient ID: {patient._id?.slice(-6)}</p>
                  </div>
                  <button 
                    onClick={() => router.push("/patient/profile")}
                    className="relative group"
                  >
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-105 transition-transform">
                      {(patient.firstName?.[0] || "P").toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    router.push("/login");
                  }}
                  className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section with Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Good Morning, {patient?.firstName || "Patient"}! 👋
                </h1>
                <p className="text-blue-100 text-lg mb-6">
                  Ready to take control of your health today?
                </p>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                    <p className="text-sm">Health Score</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                    <p className="text-sm">Last Visit</p>
                    <p className="text-lg font-semibold">2 days ago</p>
                  </div>
                </div>
              </div>
              <div className="h-24 w-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <stat.icon className={`h-8 w-8 text-${stat.color}-500 mb-3`} />
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(action.path)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white text-left shadow-lg hover:shadow-xl transition-all duration-200 group`}
              >
                <action.icon className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">{action.label}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Appointment Details & Discharge Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Appointment Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Appointments</h3>
              <button 
                onClick={() => router.push("/patient/appoinmentdetails")}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No appointments scheduled</p>
                  <button 
                    onClick={() => router.push("/patient/appoinments")}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Book your first appointment
                  </button>
                </div>
              ) : (
                appointments.map((appt) => (
                  <div key={appt._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Dr. {appt.doctorId?.firstName} {appt.doctorId?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{appt.doctorId?.specialization}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(appt.date).toLocaleDateString()}</span>
                          <Clock className="h-3 w-3" />
                          <span>{appt.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCancelAppointment(appt._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Appointment"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push("/patient/appoinmentdetails")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Discharge Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Discharge Summaries</h3>
              <button 
                onClick={() => router.push("/patient/discharge")}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {dischargeSummaries.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No discharge summaries available</p>
                </div>
              ) : (
                dischargeSummaries.map((summary) => (
                  <div key={summary._id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{summary.doctorName}</p>
                        <p className="text-sm text-gray-600">{summary.specialization}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        summary.paymentStatus === "Paid" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {summary.paymentStatus}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{summary.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-3 w-3" />
                        <span>₹{summary.billing.totalAmount}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {summary.paymentStatus === "Pending" && (
                        <button
                          onClick={() => handlePayment(summary)}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>Pay Now</span>
                        </button>
                      )}
                      {summary.paymentStatus === "Paid" && (
                        <button
                          onClick={() => router.push("/patient/discharge")}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      )}
                      <button
                        onClick={() => router.push("/patient/discharge")}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                    DR
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Cardiologist</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Tomorrow</p>
                  <p className="text-sm text-gray-600">10:00 AM</p>
                </div>
              </div>
              <button 
                onClick={() => router.push("/patient/appoinments")}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Schedule New Appointment</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Health Tips Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">💡 Health Tip of the Day</h3>
              <p className="text-green-100 text-lg">
                "Stay hydrated and take short walking breaks every hour to maintain energy levels throughout the day."
              </p>
            </div>
            <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex justify-around items-center">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}