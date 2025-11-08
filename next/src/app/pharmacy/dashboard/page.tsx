// app/pharmacy/dashboard/page.tsx - Enhanced Modern Dashboard
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Pill, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Activity,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  ArrowLeft
} from "lucide-react";

export default function PharmacyHome() {
  const router = useRouter();
  const [pharmacist, setPharmacist] = useState<any>(null);
  const [analytics, setAnalytics] = useState({
    totalPrescriptions: 156,
    pendingDispensing: 23,
    completedToday: 18,
    lowStockItems: 7,
    totalRevenue: 28450,
    avgProcessingTime: "15min"
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }
    setPharmacist(user);
  }, [router]);

  const statsCards = [
    {
      title: "Total Prescriptions",
      value: analytics.totalPrescriptions,
      icon: ClipboardList,
      color: "bg-blue-500",
      trend: "+12%",
      description: "This month"
    },
    {
      title: "Pending Dispensing",
      value: analytics.pendingDispensing,
      icon: Clock,
      color: "bg-orange-500",
      trend: "+5%",
      description: "Require attention"
    },
    {
      title: "Completed Today",
      value: analytics.completedToday,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "+8%",
      description: "Successful dispenses"
    },
    {
      title: "Low Stock Items",
      value: analytics.lowStockItems,
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: "-2%",
      description: "Need restocking"
    }
  ];

  const quickActions = [
    {
      title: "📜 Process Prescriptions",
      description: "Review and dispense doctor prescriptions",
      icon: ClipboardList,
      onClick: () => router.push("/pharmacy/prescription"),
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "📦 Stock Management",
      description: "Manage medicine inventory and levels",
      icon: Package,
      onClick: () => router.push("/pharmacy/stock"),
      color: "from-green-500 to-green-600"
    },
    {
      title: "🧾 Current Stock View",
      description: "Real-time medicine availability",
      icon: Pill,
      onClick: () => router.push("/pharmacy/currentstock"),
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-2xl mr-4">
                <Pill className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Pharmacy Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive pharmacy management system</p>
              </div>
            </div>
            
            {pharmacist && (
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <h2
                      onClick={() => router.push("/pharmacy/profile")}
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-green-600 transition-colors"
                    >
                      {pharmacist.name || pharmacist.email}
                    </h2>
                    <p className="text-sm text-gray-600">Pharmacy Department</p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      router.push("/login");
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 shadow-sm transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{stat.trend}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className={`bg-gradient-to-r ${action.color} rounded-2xl p-6 text-white cursor-pointer shadow-sm hover:shadow-md transition-all`}
                  >
                    <action.icon size={32} className="mb-3" />
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div className="space-y-4">
                {[
                  { action: "Dispensed Amoxicillin", patient: "John Doe", time: "2 min ago", status: "completed" },
                  { action: "Processed Prescription", patient: "Sarah Wilson", time: "15 min ago", status: "completed" },
                  { action: "Low Stock Alert", patient: "Paracetamol", time: "1 hour ago", status: "warning" },
                  { action: "New Prescription", patient: "Mike Johnson", time: "2 hours ago", status: "pending" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' : 
                        activity.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.patient}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Analytics Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Average Processing Time</span>
                      <span className="font-semibold text-gray-900">{analytics.avgProcessingTime}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Prescription Accuracy</span>
                      <span className="font-semibold text-gray-900">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-5/6"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Patient Satisfaction</span>
                      <span className="font-semibold text-gray-900">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full w-9/10"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart size={24} />
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
                <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-green-100 text-sm mt-2">+15% from last month</p>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  {[
                    { service: "Prescription Processing", status: "Operational", color: "text-green-500" },
                    { service: "Inventory Management", status: "Operational", color: "text-green-500" },
                    { service: "Stock Alerts", status: "Active", color: "text-green-500" },
                    { service: "Reporting System", status: "Operational", color: "text-green-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.service}</span>
                      <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}