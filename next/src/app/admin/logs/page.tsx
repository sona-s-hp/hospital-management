'use client';

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Stethoscope, 
  UserCheck, 
  Microscope, 
  Pill, 
  Scan, 
  Calendar,
  DollarSign,
  Activity,
  Download,
  Filter,
  Eye,
  BarChart3,
  Target,
  Clock,
  Heart,
  Shield
} from 'lucide-react';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/admin/summary`);
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Mock data for enhanced analytics
  const enhancedStats = stats ? {
    ...stats,
    monthlyRevenue: 124500,
    patientGrowth: 12.5,
    revenueGrowth: 18.2,
    avgResponseTime: 2.3,
    patientSatisfaction: 94,
    staffProductivity: 87,
    systemUptime: 99.8
  } : null;

  const pieData = enhancedStats ? [
    { name: "Doctors", value: enhancedStats.totalDoctors, color: "#8884d8" },
    { name: "Patients", value: enhancedStats.totalPatients, color: "#82ca9d" },
    { name: "Labs", value: enhancedStats.totalLabs, color: "#ffc658" },
    { name: "Pharmacy", value: enhancedStats.totalPharmacy, color: "#ff7f50" },
    { name: "Radiology", value: enhancedStats.totalRadiology, color: "#00bfff" },
  ] : [];

  const barData = enhancedStats ? [
    { name: "Doctors", Count: enhancedStats.totalDoctors, Growth: 5.2 },
    { name: "Patients", Count: enhancedStats.totalPatients, Growth: 12.5 },
    { name: "Labs", Count: enhancedStats.totalLabs, Growth: 3.1 },
    { name: "Pharmacy", Count: enhancedStats.totalPharmacy, Growth: 8.7 },
    { name: "Radiology", Count: enhancedStats.totalRadiology, Growth: 4.3 },
  ] : [];

  const revenueData = [
    { month: 'Jan', revenue: 98000, patients: 210 },
    { month: 'Feb', revenue: 102000, patients: 245 },
    { month: 'Mar', revenue: 115000, patients: 278 },
    { month: 'Apr', revenue: 124500, patients: 312 },
    { month: 'May', revenue: 118000, patients: 295 },
    { month: 'Jun', revenue: 132000, patients: 334 }
  ];

  const performanceData = [
    { category: 'Response Time', value: 87, target: 90 },
    { category: 'Satisfaction', value: 94, target: 95 },
    { category: 'Uptime', value: 99.8, target: 99.9 },
    { category: 'Productivity', value: 87, target: 85 }
  ];

  const departmentData = [
    { name: "Cardiology", value: 28, color: "#8884d8" },
    { name: "Orthopedics", value: 22, color: "#82ca9d" },
    { name: "Neurology", value: 15, color: "#ffc658" },
    { name: "Pediatrics", value: 20, color: "#ff7f50" },
    { name: "Gynecology", value: 15, color: "#00bfff" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (!enhancedStats) return <div className="min-h-screen flex justify-center items-center text-lg font-semibold">Failed to load analytics data.</div>;

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Comprehensive insights and performance metrics for Zane Care Medical
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-lg transition-all duration-300"
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
              +{enhancedStats.patientGrowth}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{enhancedStats.totalPatients.toLocaleString()}</h3>
          <p className="text-gray-600 font-medium">Total Patients</p>
          <p className="text-sm text-gray-500">Active registrations</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <Stethoscope className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{enhancedStats.totalDoctors}</h3>
          <p className="text-gray-600 font-medium">Medical Doctors</p>
          <p className="text-sm text-gray-500">Across departments</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
              +{enhancedStats.revenueGrowth}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{enhancedStats.monthlyRevenue.toLocaleString()}</h3>
          <p className="text-gray-600 font-medium">Monthly Revenue</p>
          <p className="text-sm text-gray-500">Current month</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
              Excellent
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{enhancedStats.patientSatisfaction}%</h3>
          <p className="text-gray-600 font-medium">Satisfaction Rate</p>
          <p className="text-sm text-gray-500">Patient feedback</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue & Patient Growth */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue & Patient Growth</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Last 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Revenue (₹)" />
              <Area type="monotone" dataKey="patients" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Patients" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Entity Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Entity Distribution</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} />
              <span>Total: {pieData.reduce((sum, item) => sum + item.value, 0)}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationDuration={1000}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} name="Current" />
              <Line type="monotone" dataKey="target" stroke="#ff7300" strokeWidth={2} name="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Department Distribution</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope size={16} />
              <span>Medical Departments</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Partner Services Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Partner Services Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Microscope className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{enhancedStats.totalLabs}</h3>
            <p className="text-gray-600">Diagnostic Labs</p>
            <p className="text-sm text-green-600 font-medium">+3.1% growth</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{enhancedStats.totalPharmacy}</h3>
            <p className="text-gray-600">Pharmacy Partners</p>
            <p className="text-sm text-green-600 font-medium">+8.7% growth</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{enhancedStats.totalRadiology}</h3>
            <p className="text-gray-600">Radiology Centers</p>
            <p className="text-sm text-green-600 font-medium">+4.3% growth</p>
          </div>
        </div>
      </div>

      {/* System Health Footer */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">System Health & Performance</h2>
            <p className="text-purple-100">
              All systems operating optimally with {enhancedStats.systemUptime}% uptime. 
              Real-time monitoring shows excellent performance across all services.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <Activity size={16} className="text-white" />
              <span className="font-semibold">{enhancedStats.avgResponseTime}s Response</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <Shield size={16} className="text-white" />
              <span className="font-semibold">{enhancedStats.systemUptime}% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}