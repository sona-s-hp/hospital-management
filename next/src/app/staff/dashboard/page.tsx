'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  User, 
  FileText, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut,
  Stethoscope,
  Pill,
  Microscope,
  Clock,
  TrendingUp
} from "lucide-react";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  trend?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ 
  title, 
  desc, 
  icon: Icon, 
  onClick, 
  color 
}: { 
  title: string; 
  desc: string; 
  icon: any; 
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/20 group"
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </motion.div>
  );
}

function NavigationCard({ 
  title, 
  desc, 
  onClick, 
  icon: Icon 
}: { 
  title: string; 
  desc: string; 
  onClick: () => void;
  icon: any;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="cursor-pointer bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-blue-100/50 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}

export default function StaffDashboard() {
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New discharge summary required for Patient #123", time: "5 min ago", unread: true },
    { id: 2, message: "Lab results available for review", time: "1 hour ago", unread: true },
    { id: 3, message: "Weekly staff meeting tomorrow", time: "2 hours ago", unread: false }
  ]);

  useEffect(() => {
    fetchStaffProfile();
  }, []);

  const fetchStaffProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/staff/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setStaff(data.staff);
      } else {
        console.error(data.message);
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Error fetching staff profile:", err);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (!staff)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">Could not load your staff profile.</p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-sm shadow-xl border-r border-gray-200/50 flex flex-col">
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-xl font-bold text-gray-800">MediCare Staff</h1>
          <p className="text-gray-600 text-sm">Hospital Management</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "patients", icon: Users, label: "Patients" },
              { id: "schedule", icon: Calendar, label: "Schedule" },
              { id: "reports", icon: FileText, label: "Reports" },
              { id: "settings", icon: Settings, label: "Settings" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
              <p className="text-gray-600">Welcome back, {staff.firstName}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-3 bg-white/50 rounded-xl p-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {staff.firstName?.[0]}{staff.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{staff.firstName} {staff.lastName}</p>
                  <p className="text-sm text-gray-600">{staff.department || "Staff"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold mb-2">
                    👋 Welcome, {staff.firstName} {staff.lastName}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    "The best way to find yourself is to lose yourself in the service of others."
                  </p>
                </div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-20">
                  <Stethoscope size={120} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Today's Patients"
                  value="24"
                  icon={Users}
                  color="bg-blue-500"
                  trend="+12%"
                />
                <StatCard
                  title="Pending Discharges"
                  value="8"
                  icon={FileText}
                  color="bg-orange-500"
                  trend="+2"
                />
                <StatCard
                  title="Lab Reports"
                  value="15"
                  icon={Microscope}
                  color="bg-green-500"
                  trend="+5"
                />
                <StatCard
                  title="Avg. Response Time"
                  value="12m"
                  icon={Clock}
                  color="bg-purple-500"
                  trend="-2m"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickActionCard
                  title="Patient Records"
                  desc="Access and manage patient medical records"
                  icon={Users}
                  onClick={() => router.push("/staff/patients")}
                  color="bg-blue-500"
                />
                <QuickActionCard
                  title="Discharge Summaries"
                  desc="Create and manage discharge documents"
                  icon={FileText}
                  onClick={() => router.push("/staff/discharge")}
                  color="bg-green-500"
                />
                <QuickActionCard
                  title="Lab Results"
                  desc="View and process laboratory reports"
                  icon={Microscope}
                  onClick={() => router.push("/staff/lab")}
                  color="bg-orange-500"
                />
                <QuickActionCard
                  title="Pharmacy"
                  desc="Manage medication and prescriptions"
                  icon={Pill}
                  onClick={() => router.push("/staff/pharmacy")}
                  color="bg-purple-500"
                />
              </div>

              {/* Main Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <NavigationCard
                  title="📄 Discharge Summaries"
                  desc="View and create detailed discharge summaries for patients, ensuring smooth transitions from hospital to home care."
                  onClick={() => router.push("/staff/discharge")}
                  icon={FileText}
                />
                
                <NavigationCard
                  title="👥 Patient Management"
                  desc="Manage patient records, appointments, and medical history in one centralized location."
                  onClick={() => router.push("/staff/patients")}
                  icon={Users}
                />

                <NavigationCard
                  title="📊 Reports & Analytics"
                  desc="Access comprehensive reports and analytics for better decision making and patient care."
                  onClick={() => router.push("/staff/reports")}
                  icon={TrendingUp}
                />

                <NavigationCard
                  title="🕒 Schedule Manager"
                  desc="Organize and manage your daily schedule, appointments, and staff assignments."
                  onClick={() => router.push("/staff/schedule")}
                  icon={Calendar}
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <p className="text-gray-800">{notification.message}</p>
                        <p className="text-gray-500 text-sm">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== "dashboard" && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This section is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}