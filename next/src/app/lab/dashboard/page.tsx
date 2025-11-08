// app/lab/dashboard/page.tsx - Fixed Version
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TestTube, 
  Microscope, 
  BarChart3, 
  Activity,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  User,
  Mail,
  Stethoscope,
  Beaker
} from "lucide-react";

const quotes = [
  "Science never sleeps, and neither do we.",
  "Precision in every test, care in every result.",
  "Behind every diagnosis is a story of data.",
  "Laboratory: where evidence meets expertise.",
  "Every sample tells a story, every test saves a life."
];

const captions = [
  "Your trusted lab partner in healthcare excellence.",
  "Turning samples into solutions.",
  "Accuracy, speed, and care—our promise.",
  "Innovation in every test we perform."
];

export default function LabHome() {
  const router = useRouter();
  const [labUser, setLabUser] = useState<any>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock analytics data
  const [analytics, setAnalytics] = useState({
    totalTests: 156,
    pendingTests: 23,
    completedToday: 18,
    criticalResults: 7,
    avgProcessingTime: "2.5h",
    accuracyRate: "99.8%"
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }
    setLabUser(user);
  }, [router]);

  // Quotes and Captions cycle
  useEffect(() => {
    const quoteInt = setInterval(() => setQuoteIndex((p) => (p + 1) % quotes.length), 5000);
    const capInt = setInterval(() => setCaptionIndex((p) => (p + 1) % captions.length), 6000);
    return () => { clearInterval(quoteInt); clearInterval(capInt); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const statsCards = [
    {
      title: "Total Tests",
      value: analytics.totalTests,
      icon: TestTube,
      color: "bg-blue-500",
      trend: "+12%",
      description: "This month"
    },
    {
      title: "Pending Tests",
      value: analytics.pendingTests,
      icon: Clock,
      color: "bg-orange-500",
      trend: "+5%",
      description: "Require processing"
    },
    {
      title: "Completed Today",
      value: analytics.completedToday,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "+8%",
      description: "Successful tests"
    },
    {
      title: "Critical Results",
      value: analytics.criticalResults,
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: "-2%",
      description: "Need attention"
    }
  ];

  const quickActions = [
    {
      title: "🧫 Test Requests",
      description: "View and manage lab test requests",
      icon: TestTube,
      onClick: () => router.push("/lab/patientdetailsbydoctor"),
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "🔬 Lab Profile",
      description: "Manage laboratory information",
      icon: Microscope,
      onClick: () => router.push("/lab/profile"),
      color: "from-green-500 to-green-600"
    },
    {
      title: "📊 Test Analytics",
      description: "View test statistics and trends",
      icon: BarChart3,
      onClick: () => setActiveTab("analytics"),
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-2xl mr-4">
                <Beaker className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Laboratory Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Advanced diagnostic management system</p>
              </div>
            </div>
            
            {labUser && (
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <h2
                      onClick={() => router.push("/lab/profile")}
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {labUser.name || labUser.email}
                    </h2>
                    <p className="text-sm text-gray-600">Laboratory Department</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 shadow-sm transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "analytics", label: "Analytics", icon: Activity },
              { id: "reports", label: "Reports", icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Quick Actions & Recent Activity */}
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
                    <h2 className="text-xl font-semibold text-gray-900">Recent Test Requests</h2>
                    <TrendingUp className="text-blue-500" size={20} />
                  </div>
                  <div className="space-y-4">
                    {[
                      { test: "CBC", patient: "John Doe", time: "2 min ago", status: "pending" },
                      { test: "Lipid Profile", patient: "Sarah Wilson", time: "15 min ago", status: "completed" },
                      { test: "Thyroid Panel", patient: "Mike Johnson", time: "1 hour ago", status: "critical" },
                      { test: "Blood Glucose", patient: "Emma Davis", time: "2 hours ago", status: "pending" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'completed' ? 'bg-green-500' : 
                            activity.status === 'critical' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.test}</p>
                            <p className="text-sm text-gray-500">{activity.patient}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Performance Metrics */}
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
                          <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Test Accuracy</span>
                          <span className="font-semibold text-gray-900">{analytics.accuracyRate}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-5/6"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Turnaround Efficiency</span>
                          <span className="font-semibold text-gray-900">94%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full w-9/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab System Status</h3>
                    <div className="space-y-3">
                      {[
                        { service: "Hematology Analyzer", status: "Operational", color: "text-green-500" },
                        { service: "Chemistry Panel", status: "Operational", color: "text-green-500" },
                        { service: "Microbiology", status: "Maintenance", color: "text-orange-500" },
                        { service: "Pathology", status: "Operational", color: "text-green-500" },
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
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Volume Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Volume Trends</h3>
              <div className="space-y-4">
                {[
                  { test: "CBC", volume: 45, trend: "+12%" },
                  { test: "Lipid Profile", volume: 32, trend: "+8%" },
                  { test: "Thyroid Panel", volume: 28, trend: "+15%" },
                  { test: "Blood Glucose", volume: 38, trend: "+5%" },
                  { test: "Liver Function", volume: 24, trend: "+3%" },
                ].map((item, index) => (
                  <div key={item.test} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">{item.test}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{item.volume}</span>
                      <span className="text-green-600 text-sm ml-2">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Department Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Users className="mx-auto text-blue-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">Lab Technicians</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Activity className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-sm text-gray-600">Operation</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <TestTube className="mx-auto text-orange-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Active Analyzers</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <TrendingUp className="mx-auto text-purple-600 mb-2" size={24} />
                  <p className="text-2xl font-bold text-gray-900">+22%</p>
                  <p className="text-sm text-gray-600">Efficiency</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}