'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Syringe, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Eye, 
  FileText,
  Search,
  Filter,
  MoreVertical,
  Stethoscope,
  Shield,
  Activity,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Patient = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

type Procedure = {
  name: string;
  performedAt: string;
};

type VaccinationRequest = {
  _id: string;
  patient: Patient | null;
  vaccineType: string;
  date: string;
  time: string;
  status: string;
  procedures: Procedure[];
  notes?: string;
};

const predefinedProcedures = [
  "Check vitals and medical history",
  "Verify vaccine type and dosage",
  "Administer vaccine injection",
  "Observe for 15-30 minutes",
  "Monitor for adverse reactions",
  "Record vaccination details",
  "Provide aftercare instructions",
  "Schedule follow-up if needed"
];

export default function DoctorVaccinationAppointments() {
  const router = useRouter();
  const [requests, setRequests] = useState<VaccinationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VaccinationRequest | null>(null);
  const [message, setMessage] = useState("");
  const [doctor, setDoctor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          setMessage("Doctor not logged in");
          setLoading(false);
          return;
        }

        const resDoctor = await fetch(`/api/doctor/byUser/${user._id}`);
        const dataDoctor = await resDoctor.json();
        if (!dataDoctor.success) {
          setMessage("Doctor profile not found");
          setLoading(false);
          return;
        }

        const doctorId = dataDoctor.doctor._id;
        setDoctor(dataDoctor.doctor);

        const res = await fetch(`/api/vaccination/doctor/${doctorId}`);
        const data = await res.json();
        if (data.success) setRequests(data.requests);
      } catch (err) {
        console.error(err);
        setMessage("Error loading appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter requests - FIXED with null safety
  const filteredRequests = requests.filter(request => {
    const patientFirstName = request.patient?.firstName || '';
    const patientLastName = request.patient?.lastName || '';
    const vaccineType = request.vaccineType || '';
    
    const matchesSearch = 
      patientFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccineType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && request.status === filterStatus;
  });

  // Handle checkbox toggle
  const handleCheckboxChange = (procName: string, checked: boolean) => {
    if (!selectedRequest) return;

    let updatedProcedures = [...selectedRequest.procedures];

    if (checked) {
      if (!updatedProcedures.some(p => p.name === procName)) {
        updatedProcedures.push({ name: procName, performedAt: new Date().toISOString() });
      }
    } else {
      updatedProcedures = updatedProcedures.filter(p => p.name !== procName);
    }

    setSelectedRequest({ ...selectedRequest, procedures: updatedProcedures });
  };

  // Submit procedures & mark completed
  const handleSubmitProcedures = async () => {
    if (!selectedRequest || selectedRequest.procedures.length === 0) {
      alert("Please select at least one procedure");
      return;
    }

    const proceduresToSend = selectedRequest.procedures.map(p => ({
      name: p.name,
      performedAt: p.performedAt,
    }));

    try {
      const res = await fetch(`/api/vaccination/addProcedure/${selectedRequest._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedures: proceduresToSend }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(`❌ ${data.message || "Failed to add procedures"}`);
        return;
      }

      // Update status to Completed
      const resStatus = await fetch(`/api/vaccination/updateStatus/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      const dataStatus = await resStatus.json();
      if (!dataStatus.success) {
        setMessage(`❌ ${dataStatus.message || "Failed to update status"}`);
        return;
      }

      setRequests(prev =>
        prev.map(r =>
          r._id === data.request._id ? { ...data.request, status: "Completed" } : r
        )
      );

      setMessage("✅ Vaccination procedures completed successfully!");
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error while submitting procedures");
    }
  };

  // Download PDF report
  const handleDownloadReport = async (request: VaccinationRequest, doctor: any) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("ZANE CARE HOSPITAL", 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Vaccination Report", 105, 22, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Doctor Information
    doc.setFontSize(14);
    doc.text("DOCTOR INFORMATION", 20, 45);
    doc.setFontSize(10);
    doc.text(`Name: Dr. ${doctor.firstName} ${doctor.lastName}`, 20, 55);
    doc.text(`Specialization: ${doctor.specialization}`, 20, 62);
    doc.text(`Department: ${doctor.department}`, 20, 69);
    doc.text(`Contact: ${doctor.contact}`, 20, 76);

    // Patient Information
    doc.setFontSize(14);
    doc.text("PATIENT INFORMATION", 20, 95);
    doc.setFontSize(10);
    doc.text(`Name: ${request.patient?.firstName || 'N/A'} ${request.patient?.lastName || 'N/A'}`, 20, 105);
    doc.text(`Vaccine Type: ${request.vaccineType}`, 20, 112);
    doc.text(`Date: ${new Date(request.date).toLocaleDateString()}`, 20, 119);
    doc.text(`Time: ${request.time}`, 20, 126);
    doc.text(`Status: ${request.status}`, 20, 133);

    // Procedures
    doc.setFontSize(14);
    doc.text("PROCEDURES PERFORMED", 20, 150);
    doc.setFontSize(10);
    
    if (request.procedures.length > 0) {
      request.procedures.forEach((p, i) => {
        const yPos = 160 + (i * 7);
        if (yPos < 280) { // Prevent overflow
          doc.text(`• ${p.name}`, 25, yPos);
          doc.text(`Performed: ${new Date(p.performedAt).toLocaleString()}`, 120, yPos);
        }
      });
    } else {
      doc.text("No procedures recorded.", 25, 160);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Generated by Zane Care Hospital - Comprehensive Healthcare System", 105, 290, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 295, { align: 'center' });

    doc.save(`Vaccination_Report_${request.patient?.firstName || 'Patient'}_${request.patient?.lastName || 'Unknown'}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Scheduled': return <Clock className="w-4 h-4" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading vaccination appointments...</p>
        </div>
      </div>
    );

  if (requests.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <Syringe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vaccination Appointments</h2>
            <p className="text-gray-600 mb-6">
              You don't have any vaccination appointments scheduled at the moment.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-lg p-3 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Syringe className="w-6 h-6 text-white" />
                </div>
                Vaccination Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track patient vaccination procedures
              </p>
            </div>
          </div>

          {doctor && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-600">Vaccination Specialist</p>
              <p className="font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              <p className="text-sm text-blue-600">{doctor.specialization}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {requests.filter(r => r.status === 'Completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {requests.filter(r => r.status === 'Scheduled').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {requests.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients, vaccine types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </motion.div>

        {/* Appointments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vaccine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Procedures
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {request.patient?.firstName || 'Unknown'} {request.patient?.lastName || 'Patient'}
                          </div>
                          {request.patient?.email && (
                            <div className="text-sm text-gray-500">{request.patient.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Syringe className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium text-gray-900">{request.vaccineType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {request.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.procedures.length} / {predefinedProcedures.length}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(request.procedures.length / predefinedProcedures.length) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                            request.status === "Completed" 
                              ? "bg-green-600 text-white hover:bg-green-700" 
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {request.status === "Completed" ? "View" : "Manage"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Success Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal for viewing or updating a request */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Vaccination Management
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Doctor Information */}
              {doctor && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Medical Professional</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Name:</span>
                      <p>Dr. {doctor.firstName} {doctor.lastName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Specialization:</span>
                      <p>{doctor.specialization}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Department:</span>
                      <p>{doctor.department}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Contact:</span>
                      <p>{doctor.contact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Information */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{selectedRequest.patient?.firstName || 'Unknown'} {selectedRequest.patient?.lastName || 'Patient'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vaccine Type:</span>
                    <p className="text-gray-900">{selectedRequest.vaccineType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-900">{new Date(selectedRequest.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <p className="text-gray-900">{selectedRequest.time}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.status !== "Completed" ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vaccination Procedures</h3>
                  <p className="text-gray-600 text-sm">
                    Select the procedures you have performed for this vaccination appointment.
                  </p>
                  
                  <div className="space-y-3">
                    {predefinedProcedures.map((proc, i) => (
                      <label key={i} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRequest.procedures.some(p => p.name === proc)}
                          onChange={(e) => handleCheckboxChange(proc, e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{proc}</span>
                          {selectedRequest.procedures.some(p => p.name === proc) && (
                            <p className="text-green-600 text-sm mt-1">
                              Completed at {new Date(selectedRequest.procedures.find(p => p.name === proc)!.performedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitProcedures}
                    disabled={selectedRequest.procedures.length === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete Vaccination ({selectedRequest.procedures.length}/{predefinedProcedures.length})
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-900">Vaccination Completed</h3>
                    </div>
                    <p className="text-green-700">
                      All procedures have been successfully completed and recorded.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Procedures Performed</h4>
                    <div className="space-y-2">
                      {selectedRequest.procedures.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{p.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(p.performedAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownloadReport(selectedRequest, doctor)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Report
                    </button>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}