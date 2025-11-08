'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Stethoscope, 
  UserCheck, 
  Pill, 
  Microscope, 
  Scan, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Activity,
  Download,
  Filter,
  MoreVertical,
  Sparkles,
  Target,
  Zap,
  Heart
} from 'lucide-react';

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalStaff: number;
  totalLabs: number;
  totalPharmacy: number;
  totalRadiology: number;
  monthlyRevenue: number;
  pendingLeaves: number;
  patientSatisfaction: number;
  avgResponseTime: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalPatients: 0,
    totalStaff: 0,
    totalLabs: 0,
    totalPharmacy: 0,
    totalRadiology: 0,
    monthlyRevenue: 0,
    pendingLeaves: 0,
    patientSatisfaction: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    // Simulate API call with realistic data
    setTimeout(() => {
      setStats({
        totalDoctors: 47,
        totalPatients: 1243,
        totalStaff: 28,
        totalLabs: 12,
        totalPharmacy: 8,
        totalRadiology: 6,
        monthlyRevenue: 124500,
        pendingLeaves: 5,
        patientSatisfaction: 94,
        avgResponseTime: 2.3
      });
      setLoading(false);
    }, 1500);
  }, []);

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      icon: UserCheck,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      trend: "+12.5%",
      change: "positive",
      description: "Active registrations",
      suffix: ""
    },
    {
      title: "Medical Doctors",
      value: stats.totalDoctors.toString(),
      icon: Stethoscope,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      trend: "+5.2%",
      change: "positive",
      description: "Across all departments",
      suffix: ""
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-orange-500/10 to-amber-500/10",
      trend: "+18.7%",
      change: "positive",
      description: "Current month earnings",
      suffix: ""
    },
    {
      title: "Patient Satisfaction",
      value: stats.patientSatisfaction.toString(),
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
      trend: "+3.1%",
      change: "positive",
      description: "Average rating",
      suffix: "%"
    }
  ];

  const secondaryStats = [
    {
      title: "Admin Staff",
      value: stats.totalStaff,
      icon: Users,
      color: "text-purple-600",
      change: "+2"
    },
    {
      title: "Partner Labs",
      value: stats.totalLabs,
      icon: Microscope,
      color: "text-indigo-600",
      change: "+1"
    },
    {
      title: "Pharmacies",
      value: stats.totalPharmacy,
      icon: Pill,
      color: "text-red-600",
      change: "+2"
    },
    {
      title: "Radiology Centers",
      value: stats.totalRadiology,
      icon: Scan,
      color: "text-pink-600",
      change: "+1"
    }
  ];

  const quickActions = [
    {
      title: "Add New Staff",
      description: "Register team member",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      href: "/admin/AdminStaff"
    },
    {
      title: "Register Doctor",
      description: "Onboard physician",
      icon: Stethoscope,
      color: "from-green-500 to-emerald-500",
      href: "/admin/doctors"
    },
    {
      title: "View Analytics",
      description: "Detailed reports",
      icon: Activity,
      color: "from-purple-500 to-pink-500",
      href: "/admin/logs"
    },
    {
      title: "Manage Leaves",
      description: "Approve requests",
      icon: Calendar,
      color: "from-orange-500 to-amber-500",
      href: "/admin/doctorleave"
    }
  ];

  const recentActivities = [
    { 
      action: "New patient registration completed", 
      time: "2 minutes ago", 
      type: "success",
      user: "Dr. Smith"
    },
    { 
      action: "Lab test results uploaded successfully", 
      time: "15 minutes ago", 
      type: "info",
      user: "Lab Tech"
    },
    { 
      action: "Pharmacy order dispatched", 
      time: "1 hour ago", 
      type: "success",
      user: "Pharmacy Manager"
    },
    { 
      action: "Emergency leave request submitted", 
      time: "2 hours ago", 
      type: "warning",
      user: "Dr. Johnson"
    },
    { 
      action: "Discharge summary generated", 
      time: "3 hours ago", 
      type: "info",
      user: "Nursing Staff"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Enhanced Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Welcome back, Admin!
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl">
            Here's what's happening at <span className="font-semibold text-cyan-600">Zane Care Medical</span> today. 
            Your healthcare management hub.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-lg"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-200/50 p-6 transition-all duration-500 hover:scale-105"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${card.bgColor} shadow-lg`}>
                    <Icon className={`w-7 h-7 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-green-700 text-sm font-semibold">{card.trend}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-gray-900 flex items-end gap-1">
                    {card.value}
                    {card.suffix && <span className="text-xl text-gray-600">{card.suffix}</span>}
                  </h3>
                  <p className="text-gray-700 font-semibold">{card.title}</p>
                  <p className="text-gray-500 text-sm">{card.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/50 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Activity className="w-4 h-4 mr-2" />
                    <span>Live updated</span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats and Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="group p-4 rounded-2xl border border-gray-200/50 hover:border-transparent bg-gradient-to-br from-white to-gray-50/80 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} w-fit mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Secondary Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">System Overview</h2>
              <Target className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="space-y-4">
              {secondaryStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50/80 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-white transition-colors">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="font-medium text-gray-700">{stat.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg">{stat.value}</span>
                      <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">Latest</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="group p-4 rounded-2xl border border-gray-200/50 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{activity.action}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{activity.time}</span>
                      <span className="text-xs text-cyan-600 font-medium">{activity.user}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 p-3 text-center text-cyan-600 hover:text-cyan-700 font-semibold rounded-2xl hover:bg-cyan-50/50 transition-colors">
            View All Activities
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">System Status: Optimal Performance</h2>
              <p className="text-cyan-100 text-lg">
                All healthcare services are operating at peak efficiency. 
                Real-time monitoring shows excellent system health.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">98.7% Uptime</span>
              </div>
              <button className="bg-white text-cyan-600 px-6 py-3 rounded-2xl font-semibold hover:bg-cyan-50 transition-colors shadow-lg">
                View Details
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
    </div>
  );
}