'use client';
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

// Types
interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  email: string;
  contact: string;
  experience: number;
  qualifications: string[];
}

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingTasks: number;
  monthlyRevenue: number;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AnalyticsData {
  weeklyAppointments: { day: string; appointments: number }[];
  patientDemographics: { name: string; value: number }[];
  revenueData: { month: string; revenue: number }[];
  specializationStats: { name: string; value: number }[];
}

const carouselImages = ["/images/doctor1.webp", "/images/doctor2.jpg", "/images/doctor3.webp"];
const carouselQuotes = [
  "Healing hands, caring hearts.",
  "Every patient is a story, every treatment a journey.",
  "Compassion and expertise, the hallmarks of a great doctor.",
  "Where science meets empathy, lives are changed."
];

const cardsData = [
  { 
    title: "🩺 My Patients", 
    desc: "View and manage your assigned patients, visits, and reports.", 
    route: "/doctor/patientappoinmentview", 
    img: "/images/card2.webp",
    color: "from-blue-500 to-cyan-500",
    icon: "👥"
  },
  { 
    title: "💉 Vaccination Appointments", 
    desc: "View patients who booked vaccination appointments with you.", 
    route: "/doctor/vaccinationappointments", 
    img: "/images/card1.jpg",
    color: "from-green-500 to-emerald-500",
    icon: "💊"
  },
  { 
    title: "📞 Teleconsultation", 
    desc: "View and start video calls with your booked patients.", 
    route: "/doctor/teleconsultation", 
    img: "/images/card3.jpg",
    color: "from-purple-500 to-indigo-500",
    icon: "🎥"
  },
  { 
    title: "🚨 Emergency Leave", 
    desc: "Apply for an emergency leave and notify admin.", 
    route: "/doctor/emergencyleave", 
    img: "/images/card4.jpg",
    color: "from-red-500 to-pink-500",
    icon: "⏰"
  },
  { 
    title: "📝 Leave Management", 
    desc: "Submit leave requests and view leave history.", 
    route: "/doctor/leaveview", 
    img: "/images/card5.jpg",
    color: "from-orange-500 to-amber-500",
    icon: "📋"
  },
  { 
    title: "👤 Profile", 
    desc: "Manage your professional profile and settings.", 
    route: "/doctor/profile", 
    img: "/images/card6.jpg",
    color: "from-teal-500 to-cyan-500",
    icon: "⚙️"
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingTasks: 0,
    monthlyRevenue: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    weeklyAppointments: [],
    patientDemographics: [],
    revenueData: [],
    specializationStats: []
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch doctor info
        const res = await fetch(`/api/doctor/byUser/${user._id}`);
        const data = await res.json();
        if (data.success) setDoctor(data.doctor);

        // Mock stats data
        setStats({
          totalPatients: 142,
          todayAppointments: 8,
          pendingTasks: 12,
          monthlyRevenue: 12500
        });

        // Mock appointments
        setAppointments([
          { id: '1', patientName: 'John Smith', time: '09:00 AM', type: 'Consultation', status: 'scheduled' },
          { id: '2', patientName: 'Sarah Johnson', time: '10:30 AM', type: 'Follow-up', status: 'scheduled' },
          { id: '3', patientName: 'Mike Wilson', time: '02:00 PM', type: 'Vaccination', status: 'scheduled' },
        ]);

        // Mock analytics data
        setAnalytics({
          weeklyAppointments: [
            { day: 'Mon', appointments: 12 },
            { day: 'Tue', appointments: 15 },
            { day: 'Wed', appointments: 8 },
            { day: 'Thu', appointments: 10 },
            { day: 'Fri', appointments: 14 },
            { day: 'Sat', appointments: 6 },
          ],
          patientDemographics: [
            { name: 'Pediatric', value: 35 },
            { name: 'Adult', value: 45 },
            { name: 'Geriatric', value: 20 },
          ],
          revenueData: [
            { month: 'Jan', revenue: 12000 },
            { month: 'Feb', revenue: 15000 },
            { month: 'Mar', revenue: 11000 },
            { month: 'Apr', revenue: 18000 },
            { month: 'May', revenue: 12500 },
          ],
          specializationStats: [
            { name: 'Cardiology', value: 25 },
            { name: 'Neurology', value: 20 },
            { name: 'Orthopedics', value: 30 },
            { name: 'Pediatrics', value: 15 },
            { name: 'Others', value: 10 },
          ]
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Carousel auto-change every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
      setQuoteIndex((prev) => (prev + 1) % carouselQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-r ${color} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-sm opacity-80 mt-1">{subtitle}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${color} cursor-pointer hover:shadow-lg transition-all`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <span className="text-white text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediCare Dashboard</h1>
                <p className="text-gray-500">Comprehensive Healthcare Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                {doctor && (
                  <>
                    <h2 className="font-semibold text-gray-800">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {doctor.specialization} • {doctor.department}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            subtitle="This month"
            icon="👥"
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            subtitle="Scheduled"
            icon="📅"
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            subtitle="To complete"
            icon="⏳"
            color="from-orange-500 to-amber-500"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="Current month"
            icon="💰"
            color="from-purple-500 to-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appointments Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Appointments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Demographics */}
          <div className="space-y-8">
            {/* Today's Appointments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.time} • {appointment.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Patient Demographics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Patient Demographics</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.patientDemographics}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {analytics.patientDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard
                  title="New Prescription"
                  description="Create medication orders"
                  icon="💊"
                  color="border-l-blue-500"
                  onClick={() => router.push('/doctor/prescription')}
                />
                <QuickActionCard
                  title="Lab Reports"
                  description="View test results"
                  icon="🔬"
                  color="border-l-green-500"
                  onClick={() => router.push('/doctor/lab-reports')}
                />
                <QuickActionCard
                  title="Medical Records"
                  description="Patient history"
                  icon="📋"
                  color="border-l-purple-500"
                  onClick={() => router.push('/doctor/records')}
                />
                <QuickActionCard
                  title="Emergency"
                  description="Urgent cases"
                  icon="🚨"
                  color="border-l-red-500"
                  onClick={() => router.push('/doctor/emergency')}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Healthcare Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardsData.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
                onClick={() => router.push(card.route)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-20`}></div>
                  <div className="absolute top-4 right-4 text-3xl">
                    {card.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.desc}</p>
                  <button className="mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    Access Module →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Zane Care Hospital</h4>
            <p className="text-gray-300 leading-relaxed">
              Premier healthcare institution providing cutting-edge medical services with compassion and excellence since 2005.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Medical Departments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Emergency Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health Checkups</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Patient Portal</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-gray-300">
              <p>📍 123 Healthcare Ave, Medical District</p>
              <p>📞 +1 (555) 123-HEAL</p>
              <p>✉️ contact@zanecare.com</p>
              <p>🕒 24/7 Emergency Services</p>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Emergency Contact</h4>
            <div className="bg-red-600 rounded-lg p-4 text-center">
              <p className="font-bold text-lg">🚨 Emergency</p>
              <p className="text-sm mt-1">Immediate Assistance</p>
              <p className="font-semibold mt-2">+1 (555) 911-HELP</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Zane Care Hospital. All rights reserved. Providing Excellence in Healthcare.</p>
        </div>
      </footer>
    </div>
  );
}