// app/pharmacy/stock/page.tsx - Enhanced with Modern UI
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Pill,
  ShoppingCart
} from "lucide-react";

export default function SubmitStock() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ name: string; qty: number }[]>([]);
  const [submittedStock, setSubmittedStock] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Enhanced medicine categories
  const medicineCategories = {
    "Pain Relief": ["Paracetamol", "Ibuprofen", "Diclofenac", "Aspirin"],
    "Antibiotics": ["Amoxicillin", "Azithromycin", "Ciprofloxacin", "Metronidazole"],
    "Vitamins & Supplements": ["Calcium Supplements", "Vitamin D", "Folic Acid", "Iron Supplements", "Multivitamin Drops"],
    "Cardiac": ["Atorvastatin", "Metoprolol", "Losartan", "Clopidogrel"],
    "Neurological": ["Gabapentin", "Clonazepam", "Carbamazepine", "Amitriptyline", "Levetiracetam"],
    "Gastrointestinal": ["ORS", "Zinc Syrup"],
    "Hormonal": ["Progesterone", "Metformin", "Clomiphene"]
  };

  // All medicines flattened
  const allMedicines = Object.values(medicineCategories).flat();

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    lowStockItems: 0,
    outOfStock: 0,
    recentlyAdded: 0
  });

  /* =====================================================
     ✅ Load pharmacy + current stock on mount
  ===================================================== */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id) return setError("User not logged in");
    setPharmacyId(user._id);

    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pharmacy/stock/${pharmacyId}`);
      const data = await res.json();
      if (data.success) {
        setSubmittedStock(data.stock || []);
        updateAnalytics(data.stock || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = (stock: any[]) => {
    setAnalytics({
      totalMedicines: stock.length,
      lowStockItems: stock.filter(item => item.qty < 10).length,
      outOfStock: stock.filter(item => item.qty === 0).length,
      recentlyAdded: stock.filter(item => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(item.updatedAt) > weekAgo;
      }).length
    });
  };

  /* =====================================================
     ✅ Handlers
  ===================================================== */
  const toggle = (name: string) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.name === name);
      if (exists) return prev.filter((s) => s.name !== name);
      return [...prev, { name, qty: 1 }];
    });
  };

  const changeQty = (name: string, qty: number) => {
    setSelected((prev) =>
      prev.map((s) => (s.name === name ? { ...s, qty } : s))
    );
  };

  const incrementQty = (name: string) => {
    setSelected(prev => prev.map(s => 
      s.name === name ? { ...s, qty: s.qty + 1 } : s
    ));
  };

  const decrementQty = (name: string) => {
    setSelected(prev => prev.map(s => 
      s.name === name && s.qty > 1 ? { ...s, qty: s.qty - 1 } : s
    ));
  };

  const handleSubmit = async () => {
    if (!pharmacyId) return setError("No pharmacy found");
    if (selected.length === 0) return setError("Select medicines first");

    try {
      const res = await axios.post(`/api/pharmacy/updatestock`, {
        pharmacyId,
        stock: Object.fromEntries(selected.map((s) => [s.name, s.qty])),
      });

      if (res.data.success) {
        alert("✅ Stock submitted successfully!");
        setSubmittedStock(res.data.stock.medicines || []);
        setSelected([]);
        fetchStock();
      } else {
        setError(res.data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while submitting stock");
    }
  };

  // Filter medicines based on search and category
  const filteredMedicines = allMedicines.filter(medicine => {
    const matchesSearch = medicine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
      Object.entries(medicineCategories).some(([category, meds]) => 
        category === categoryFilter && meds.includes(medicine)
      );
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600 mt-2">Manage your pharmacy inventory and stock levels</p>
          </div>
          <button
            onClick={fetchStock}
            className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 mt-4 lg:mt-0"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: "Total Medicines", 
              value: analytics.totalMedicines, 
              icon: Pill, 
              color: "bg-blue-500",
              description: "In inventory"
            },
            { 
              title: "Low Stock", 
              value: analytics.lowStockItems, 
              icon: AlertTriangle, 
              color: "bg-orange-500",
              description: "Need restocking"
            },
            { 
              title: "Out of Stock", 
              value: analytics.outOfStock, 
              icon: TrendingUp, 
              color: "bg-red-500",
              description: "Urgent attention"
            },
            { 
              title: "Recently Added", 
              value: analytics.recentlyAdded, 
              icon: CheckCircle, 
              color: "bg-green-500",
              description: "Last 7 days"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
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
          {/* Medicine Selection Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Add Medicines to Stock</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.keys(medicineCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Medicine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredMedicines.map((medicine) => {
                    const selectedMed = selected.find((s) => s.name === medicine);
                    const category = Object.entries(medicineCategories).find(([cat, meds]) => 
                      meds.includes(medicine)
                    )?.[0];

                    return (
                      <motion.div
                        key={medicine}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => toggle(medicine)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedMed 
                            ? "border-green-500 bg-green-50 shadow-sm" 
                            : "border-gray-200 bg-white hover:border-green-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{medicine}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {category}
                            </span>
                          </div>
                          {selectedMed && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrementQty(medicine);
                                }}
                                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-green-700 min-w-8 text-center">
                                {selectedMed.qty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  incrementQty(medicine);
                                }}
                                className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              {selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-800">
                        {selected.length} medicine{selected.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="text-sm text-green-600">
                        Total quantity: {selected.reduce((sum, item) => sum + item.qty, 0)}
                      </p>
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                    >
                      Update Stock
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Current Stock Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 h-fit sticky top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Stock</h2>
                <Package className="text-green-600" size={24} />
              </div>

              {submittedStock.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">No stock items yet</p>
                  <p className="text-sm text-gray-400">Add medicines to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {submittedStock.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border ${
                        item.qty === 0 
                          ? "bg-red-50 border-red-200" 
                          : item.qty < 10 
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className={`text-sm ${
                            item.qty === 0 ? "text-red-600" : 
                            item.qty < 10 ? "text-orange-600" : "text-gray-500"
                          }`}>
                            {item.qty} in stock
                          </p>
                        </div>
                        {item.qty === 0 && (
                          <AlertTriangle className="text-red-500" size={16} />
                        )}
                        {item.qty > 0 && item.qty < 10 && (
                          <AlertTriangle className="text-orange-500" size={16} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Stock Summary */}
              {submittedStock.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold">{submittedStock.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Need Restocking:</span>
                    <span className="font-semibold text-orange-600">
                      {submittedStock.filter(item => item.qty < 10).length}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}