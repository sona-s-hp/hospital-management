'use client';
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Patient = {
  _id: string;
  firstName: string;
  lastName: string;
};

type Teleconsultation = {
  _id: string;
  patientId: Patient | null;
  date: string;
  time?: string;
  mode: string;
  status: string;
  meetingLink?: string;
};

export default function DoctorTeleconsultations() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Teleconsultation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentCall, setCurrentCall] = useState<Teleconsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user._id) {
      router.push("/login");
      return;
    }

    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/doctor/byUser/${user._id}`);
        const data = await res.json();
        if (data.success) {
          setDoctor(data.doctor);

          // Fetch teleconsultations for this doctor
          const res2 = await fetch(`/api/teleconsultation/doctor/${data.doctor._id}`);
          const data2 = await res2.json();
          if (data2.success) {
            setConsultations(data2.requests);
            setFilteredConsultations(data2.requests);
          } else {
            setError("Failed to fetch teleconsultations");
          }
        }
      } catch (err) {
        console.error("Error fetching doctor or consultations:", err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [router]);

  // Filter consultations based on status and search
  useEffect(() => {
    let filtered = consultations;
    
    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter(consultation => consultation.status === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(consultation => 
        consultation.patientId?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.patientId?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.mode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredConsultations(filtered);
  }, [consultations, filter, searchTerm]);

  // Start simulated video call
  const startCall = (consultation: Teleconsultation) => {
    setCurrentCall(consultation);
  };

  // Stop call
  const endCall = () => {
    setCurrentCall(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Get webcam stream when a call starts
  useEffect(() => {
    if (!currentCall) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Camera access error:", err));
  }, [currentCall]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📞 My Teleconsultations
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your virtual patient appointments
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all duration-300 border border-purple-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
            <button
              onClick={() => router.refresh()}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        {doctor && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="text-gray-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {consultations.length} total consultation{consultations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients or consultation type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                    filter === status
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              ⚠️ {error}
            </div>
          )}

          {filteredConsultations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {consultations.length === 0 ? 'No consultations yet' : 'No consultations match your filters'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {consultations.length === 0 
                  ? 'Your teleconsultation appointments will appear here once patients book sessions with you.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Patient</th>
                    <th className="text-left py-4 px-6 font-semibold">Date & Time</th>
                    <th className="text-left py-4 px-6 font-semibold">Mode</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-center py-4 px-6 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredConsultations.map((consultation, index) => (
                    <tr 
                      key={consultation._id} 
                      className="hover:bg-purple-50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {consultation.patientId?.firstName?.[0]}{consultation.patientId?.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {consultation.patientId
                                ? `${consultation.patientId.firstName} ${consultation.patientId.lastName}`
                                : "Unknown Patient"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Patient ID: {consultation.patientId?._id?.slice(-8) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-800 font-medium">
                          {formatDate(consultation.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.time || 'Time not specified'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {consultation.mode === 'video' ? '📹 Video' : '📞 Audio'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultation.status)}`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {consultation.meetingLink ? (
                          <a
                            href={consultation.meetingLink}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>🎥</span>
                            Join Call
                          </a>
                        ) : consultation.status === 'scheduled' ? (
                          <button
                            onClick={() => startCall(consultation)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                          >
                            <span>📞</span>
                            Start Call
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No action available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {currentCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                📞 Calling {currentCall.patientId?.firstName} {currentCall.patientId?.lastName}
              </h3>
              <button
                onClick={endCall}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="relative bg-black rounded-xl overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <button className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors">
                  🎤
                </button>
                <button className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors">
                  📹
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={endCall}
                className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-medium flex items-center gap-2 shadow-lg"
              >
                <span>📞</span>
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}