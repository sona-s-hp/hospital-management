'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  Scan, 
  FileText, 
  BarChart3, 
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  Image,
  Download,
  Upload,
  Shield,
  Zap
} from "lucide-react";

const quotes = [
  "Seeing is believing, diagnosing is saving.",
  "Precision in imaging, excellence in care.",
  "Every scan tells a story, every report saves a life.",
  "Radiology: where technology meets compassion."
];

const extraSentences = [
  "Your eyes may see, but radiology reveals.",
  "Every pixel matters in saving lives.",
  "Behind every scan, there is a story of care.",
  "Innovation in imaging, clarity in diagnosis."
];

const stats = [
  { label: "Pending Scans", value: "12", color: "bg-orange-500", icon: Scan },
  { label: "Reports Today", value: "8", color: "bg-blue-500", icon: FileText },
  { label: "Completed", value: "24", color: "bg-green-500", icon: CheckCircle },
  { label: "Urgent Cases", value: "3", color: "bg-red-500", icon: Activity }
];

const recentActivities = [
  { id: 1, patient: "John Doe", scan: "CT Chest", time: "2 hours ago", status: "completed" },
  { id: 2, patient: "Sarah Smith", scan: "MRI Brain", time: "4 hours ago", status: "pending" },
  { id: 3, patient: "Mike Johnson", scan: "X-Ray Arm", time: "1 hour ago", status: "completed" },
  { id: 4, patient: "Emily Brown", scan: "Ultrasound", time: "30 mins ago", status: "in-progress" }
];

export default function RadiologyHome() {
  const router = useRouter();
  const [radiologist, setRadiologist] = useState<any>(null);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }
    setRadiologist(user);
  }, [router]);

  // Cycle through sentences every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSentenceIndex((prev) => (prev + 1) % extraSentences.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Radiology Dashboard</h1>
              <p className="text-sm text-gray-600">Advanced Imaging & Diagnostics</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Current Time */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-600">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Help */}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>

            {/* User Profile */}
            {radiologist && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p 
                    onClick={() => router.push("/radiology/profile")}
                    className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {radiologist.name || radiologist.email}
                  </p>
                  <p className="text-sm text-gray-600">Senior Radiologist</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
                  {radiologist.name?.charAt(0) || radiologist.email?.charAt(0) || 'R'}
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 text-white font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        {/* Quotes Section */}
        <div className="mb-8">
          <motion.div
            key={quotes[Math.floor(Math.random() * quotes.length)]}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center text-gray-800 text-xl md:text-3xl font-semibold mb-4"
          >
            {quotes[Math.floor(Math.random() * quotes.length)]}
          </motion.div>

          {/* Extra animated sentences */}
          <AnimatePresence mode="wait">
            <motion.div
              key={sentenceIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
              className="text-center text-gray-600 text-lg md:text-xl font-medium"
            >
              {extraSentences[sentenceIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% from yesterday</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                title="🖼️ Imaging Requests"
                desc="View and manage X-ray, CT, and MRI requests from doctors."
                onClick={() => router.push("/radiology/patientdetailedbydoctor")}
                icon={Scan}
                color="from-blue-500 to-blue-600"
                stats="12 pending"
              />
              <Card
                title="📊 Generate Reports"
                desc="Create detailed diagnostic reports with AI assistance."
                onClick={() => router.push("/radiology/reports")}
                icon={FileText}
                color="from-green-500 to-green-600"
                stats="8 today"
              />
              <Card
                title="📅 Appointment Schedule"
                desc="Manage your daily appointments and procedures."
                onClick={() => router.push("/radiology/schedule")}
                icon={Calendar}
                color="from-purple-500 to-purple-600"
                stats="5 scheduled"
              />
              <Card
                title="📈 Analytics Dashboard"
                desc="View imaging statistics and department performance."
                onClick={() => router.push("/radiology/analytics")}
                icon={BarChart3}
                color="from-orange-500 to-orange-600"
                stats="24% growth"
              />
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mt-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                  icon={Upload}
                  label="Upload Scan"
                  onClick={() => console.log("Upload Scan")}
                  color="bg-blue-100 text-blue-600"
                />
                <QuickAction
                  icon={Download}
                  label="Export Data"
                  onClick={() => console.log("Export Data")}
                  color="bg-green-100 text-green-600"
                />
                <QuickAction
                  icon={Shield}
                  label="Security"
                  onClick={() => console.log("Security")}
                  color="bg-purple-100 text-purple-600"
                />
                <QuickAction
                  icon={Zap}
                  label="AI Analysis"
                  onClick={() => console.log("AI Analysis")}
                  color="bg-orange-100 text-orange-600"
                />
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.patient}</p>
                    <p className="text-sm text-gray-600">{activity.scan}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* System Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">System Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CT Scanner 1</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MRI Suite</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">X-Ray Room 2</span>
                  <span className="text-sm font-medium text-yellow-600">Maintenance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">PACS Server</span>
                  <span className="text-sm font-medium text-green-600">Optimal</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, desc, onClick, icon: Icon, color, stats }: any) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      className="cursor-pointer bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-r ${color} p-3 rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {stats && (
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {stats}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, onClick, color }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center p-4 rounded-xl ${color} hover:shadow-md transition-all`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

// Add missing CheckCircle icon component
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}