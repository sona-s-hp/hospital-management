'use client';
import { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2, 
  Edit3,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Shield
} from 'lucide-react';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/display');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete a patient
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/patient/delete/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setPatients((prev) => prev.filter((p: any) => p._id !== id));
        setSuccess("Patient deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to delete patient: " + data.error);
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Network error. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Filter patients based on search and gender
  const filteredPatients = patients.filter((patient: any) => {
    const matchesSearch = 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = selectedGender === "all" || patient.gender === selectedGender;
    
    return matchesSearch && matchesGender;
  });

  // Get patient statistics
  const totalPatients = patients.length;
  const malePatients = patients.filter((p: any) => p.gender === 'male').length;
  const femalePatients = patients.filter((p: any) => p.gender === 'female').length;
  const patientsWithAddress = patients.filter((p: any) => p.address).length;

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'from-blue-500 to-cyan-500';
      case 'female': return 'from-pink-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? '👨' : gender === 'female' ? '👩' : '👤';
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
              Patient Management
            </h1>
          </div>
          <p className="text-gray-600">
            Manage and oversee all registered patients at Zane Care Medical
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <UserPlus size={20} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <span className="text-lg">👨</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Male Patients</p>
              <p className="text-2xl font-bold text-gray-900">{malePatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-xl">
              <span className="text-lg">👩</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Female Patients</p>
              <p className="text-2xl font-bold text-gray-900">{femalePatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">With Address</p>
              <p className="text-2xl font-bold text-gray-900">{patientsWithAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {success}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 shadow-lg transition-all duration-300"
            />
          </div>
          
          <select 
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 shadow-lg transition-all duration-300"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-lg transition-all duration-300">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient: any) => (
            <div key={patient._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getGenderColor(patient.gender)} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-lg font-bold">
                      {getGenderIcon(patient.gender)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-cyan-600 font-medium capitalize">{patient.gender} Patient</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-blue-500" />
                  <span className="truncate">{patient.user?.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-green-500" />
                  <span>{patient.phone || 'No phone'}</span>
                </div>

                {patient.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-red-500" />
                    <span className="line-clamp-2">{patient.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-purple-500" />
                  <span>Registered recently</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity size={16} className="text-green-500" />
                  <span>Active • Regular Checkups</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                  <Eye size={16} />
                  <span>View Profile</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(patient._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredPatients.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedGender !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No patients have been registered yet"
            }
          </p>
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            <UserPlus size={20} />
            <span>Register First Patient</span>
          </button>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Patient Care Summary</h2>
            <p className="text-cyan-100">
              Providing comprehensive healthcare management for {totalPatients} registered patients with dedicated medical support.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <Heart size={16} className="text-white" />
              <span className="font-semibold">100% Care</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <Shield size={16} className="text-white" />
              <span className="font-semibold">Secure Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}