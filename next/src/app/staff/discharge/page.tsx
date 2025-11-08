'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, User, Phone, Mail, Calendar, ArrowLeft } from "lucide-react";

function PatientCard({ patient, onClick }: { patient: any; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/20 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-gray-600 text-sm">{patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span className="truncate">{patient.email || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} />
          <span>{patient.phone || "N/A"}</span>
        </div>
      </div>

      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
      >
        Manage Discharge Summary
      </button>
    </motion.div>
  );
}

export default function DischargeSummaryPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API}/api/patient/display`);
        const data = await res.json();
        if (data.success) setPatients(data.patients);
      } catch (err) {
        console.error("❌ Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading patients...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🏥 Discharge Summary Management</h1>
              <p className="text-gray-600">Manage patient discharge summaries and transitions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/10 border border-blue-200/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
              <p className="text-blue-600 text-sm">Total Patients</p>
            </div>
            <div className="bg-green-500/10 border border-green-200/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-green-600 text-sm">Ready for Discharge</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-200/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-orange-600">8</p>
              <p className="text-orange-600 text-sm">Pending Review</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-200/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-600">24</p>
              <p className="text-purple-600 text-sm">Completed This Month</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
            >
              <option value="all">All Patients</option>
              <option value="ready">Ready for Discharge</option>
              <option value="pending">Pending Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredPatients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No patients found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <PatientCard
                  patient={patient}
                  onClick={() => router.push(`/staff/discharge/${patient._id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Motivational Footer */}
      <motion.div
        className="max-w-7xl mx-auto px-6 py-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-gray-600 text-lg italic">
          "Every patient's story deserves a thoughtful ending and a hopeful new beginning."
        </p>
        <p className="text-gray-500 mt-2 font-medium">
          💙 Dedicated to guiding patients through recovery with care and compassion.
        </p>
      </motion.div>
    </div>
  );
}