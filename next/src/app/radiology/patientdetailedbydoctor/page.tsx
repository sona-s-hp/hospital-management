'use client';

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Viewer } from "photo-sphere-viewer";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";
import { useRouter } from "next/navigation";

export default function ImagingRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const viewerRef = useRef<Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  // Fetch imaging requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/radiology/requests`);
        const data = await res.json();
        if (data.success) {
          setRequests(data.requests);
        } else {
          console.error("Failed to load requests");
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [API_BASE]);

  // Initialize or update PhotoSphereViewer
  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing viewer
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    // Initialize viewer if image uploaded or available
    if (uploadedImage) {
      viewerRef.current = new Viewer({
        panorama: uploadedImage,
        container: containerRef.current,
        loadingImg: "/spinner.gif",
        navbar: ["zoom", "fullscreen", "autorotate", "move"],
        defaultLat: 0,
        defaultLong: 0,
        mousewheel: true,
        touchmoveTwoFingers: true,
      });
    }
  }, [uploadedImage]);

  // Handle upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Save and Generate Report
  const saveReport = async () => {
    if (!selectedRequest || !uploadedImage) {
      alert("⚠️ Please upload a 360° image before saving.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/prescription/dispense/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispenseDetails: [
            {
              name: selectedRequest.medicines?.join(", ") || "Imaging Report",
              findings: "Uploaded 360° Medical Image",
              remarks: "Radiology report generated.",
            },
          ],
          totalAmount: 0,
          image: uploadedImage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Report generated successfully!");

        // Update UI
        const updatedRequests = requests.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, status: "Completed", image: uploadedImage }
            : r
        );

        setRequests(updatedRequests);
        setSelectedRequest(null);
        setUploadedImage(null);
        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }
      } else {
        alert("❌ Failed to generate report. Please check your API.");
      }
    } catch (err) {
      console.error("Error saving report:", err);
      alert("⚠️ An error occurred while saving the report.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-light">Loading imaging requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🖼️</div>
          <h2 className="text-2xl font-bold mb-2">No Imaging Requests</h2>
          <p className="text-gray-300">All imaging requests have been processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all"
          >
            ← Back
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Medical Imaging Dashboard
            </h1>
            <p className="text-gray-300 font-light">Radiology & Diagnostic Imaging</p>
          </div>

          <div className="w-24"></div>
        </motion.div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600/50 to-purple-600/50">
                <th className="px-6 py-4 text-left text-sm uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-sm uppercase">Email</th>
                <th className="px-6 py-4 text-left text-sm uppercase">Doctor</th>
                <th className="px-6 py-4 text-left text-sm uppercase">Imaging Test</th>
                <th className="px-6 py-4 text-left text-sm uppercase">Status</th>
                <th className="px-6 py-4 text-left text-sm uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <motion.tr
                  key={r._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/10 transition"
                >
                  <td className="px-6 py-4">{r.patientId?.firstName} {r.patientId?.lastName}</td>
                  <td className="px-6 py-4 text-gray-300">{r.patientId?.email}</td>
                  <td className="px-6 py-4">Dr. {r.doctorId?.firstName} {r.doctorId?.lastName}</td>
                  <td className="px-6 py-4 text-blue-300">{r.medicines?.join(", ")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      r.status === "Pending" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedRequest(r);
                        setUploadedImage(r.image || null);
                        if (viewerRef.current) {
                          viewerRef.current.destroy();
                          viewerRef.current = null;
                        }
                      }}
                      className={`px-4 py-2 rounded-xl ${
                        r.status === "Pending"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white transition`}
                    >
                      {r.status === "Pending" ? "📄 Generate" : "👁️ View"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-slate-900 rounded-3xl p-8 w-full max-w-4xl shadow-xl border border-white/10"
              >
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Imaging Report</h2>
                  <span className="text-gray-300">{selectedRequest.status}</span>
                </div>

                {selectedRequest.status === "Pending" && (
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Upload 360° Image</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-white" />
                  </div>
                )}

                <div ref={containerRef} className="w-full h-96 bg-black/40 rounded-2xl mb-6"></div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setUploadedImage(null);
                      if (viewerRef.current) viewerRef.current.destroy();
                      viewerRef.current = null;
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
                  >
                    Close
                  </button>

                  {selectedRequest.status === "Pending" && (
                    <button
                      onClick={saveReport}
                      disabled={!uploadedImage}
                      className={`px-6 py-3 rounded-xl ${
                        uploadedImage
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-500 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      💾 Save & Generate Report
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
