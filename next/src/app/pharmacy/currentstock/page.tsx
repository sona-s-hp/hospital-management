// app/pharmacy/currentstock/page.tsx - Fixed Version
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Pill,
  ShoppingCart,
  Edit3,
  Plus,
  Minus,
  Search // Added Search import
} from "lucide-react";

export default function CurrentStockPage() {
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  const pharmacyId = user?._id || null;

  const [stock, setStock] = useState<{ name: string; qty: number }[]>([]);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalValue: 0,
    criticalItems: 0,
    wellStocked: 0,
    totalCategories: 0
  });

  useEffect(() => {
    if (!pharmacyId) return;
    fetchStock();
    fetchAlerts();
  }, [pharmacyId]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pharmacy/stock/${pharmacyId}`);
      const data = await res.json();
      if (data.success) {
        setStock(data.stock || []);
        const map: Record<string, number> = {};
        (data.stock || []).forEach((m: any) => (map[m.name] = m.qty));
        setInputs(map);
        updateAnalytics(data.stock || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/pharmacy/alerts/${pharmacyId}`);
      const data = await res.json();
      if (data.success) setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateAnalytics = (stock: any[]) => {
    const critical = stock.filter(item => item.qty < 5).length;
    const wellStocked = stock.filter(item => item.qty >= 20).length;
    
    setAnalytics({
      totalValue: stock.reduce((sum, item) => sum + (item.qty * (item.price || 10)), 0),
      criticalItems: critical,
      wellStocked: wellStocked,
      totalCategories: new Set(stock.map(item => item.category)).size
    });
  };

  const handleSave = async () => {
    try {
      await axios.post(`/api/pharmacy/updatestock`, {
        pharmacyId,
        stock: inputs,
      });
      alert("✅ Stock updated successfully!");
      fetchStock();
      fetchAlerts();
    } catch (err) {
      console.error(err);
      alert("Failed to save stock");
    }
  };

  const handleQuickUpdate = async (name: string, adjustment: number) => {
    const newValue = Math.max(0, (inputs[name] || 0) + adjustment);
    setInputs(prev => ({ ...prev, [name]: newValue }));
  };

  const handleDispense = async () => {
    const toReduce = Object.entries(inputs)
      .map(([name, newQty]) => {
        const current = stock.find(s => s.name === name)?.qty || 0;
        const diff = current - newQty;
        return diff > 0 ? { name, qty: diff } : null;
      })
      .filter(Boolean);

    if (toReduce.length === 0) {
      alert("No stock reductions detected. Lower quantities to dispense.");
      return;
    }

    try {
      await axios.post(`/api/pharmacy/reduce`, {
        pharmacyId,
        medicines: toReduce,
      });
      alert("✅ Stock dispensed and updated!");
      fetchStock();
      fetchAlerts();
    } catch (err) {
      console.error(err);
      alert("Failed to dispense stock");
    }
  };

  const exportStockReport = () => {
    const reportData = stock.map(item => ({
      Medicine: item.name,
      Quantity: inputs[item.name] || item.qty,
      Status: item.qty < 5 ? 'Critical' : item.qty < 10 ? 'Low' : 'Adequate'
    }));

    const csv = [
      ['Medicine', 'Quantity', 'Status'],
      ...reportData.map(row => [row.Medicine, row.Quantity, row.Status])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy-stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter stock based on search and status
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "critical" && item.qty < 5) ||
      (statusFilter === "low" && item.qty >= 5 && item.qty < 10) ||
      (statusFilter === "adequate" && item.qty >= 10);
    
    return matchesSearch && matchesStatus;
  });

  if (!pharmacyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please login as pharmacy user to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading current stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Current Stock Overview</h1>
            <p className="text-gray-600 mt-2">Real-time inventory management and monitoring</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={exportStockReport}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            <button
              onClick={fetchStock}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: "Total Stock Value", 
              value: `₹${analytics.totalValue.toLocaleString()}`, 
              icon: TrendingUp, 
              color: "bg-blue-500",
              description: "Estimated value"
            },
            { 
              title: "Critical Items", 
              value: analytics.criticalItems, 
              icon: AlertTriangle, 
              color: "bg-red-500",
              description: "Less than 5 in stock"
            },
            { 
              title: "Well Stocked", 
              value: analytics.wellStocked, 
              icon: CheckCircle, 
              color: "bg-green-500",
              description: "20+ in stock"
            },
            { 
              title: "Categories", 
              value: analytics.totalCategories, 
              icon: BarChart3, 
              color: "bg-purple-500",
              description: "Medicine types"
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stock List */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Inventory Items</h2>
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="critical">Critical (&lt;5)</option>
                    <option value="low">Low (5-9)</option>
                    <option value="adequate">Adequate (10+)</option>
                  </select>
                </div>
              </div>

              {filteredStock.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stock items found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredStock.map((item, index) => {
                      const currentQty = inputs[item.name] ?? item.qty;
                      const status = 
                        currentQty === 0 ? 'out-of-stock' :
                        currentQty < 5 ? 'critical' :
                        currentQty < 10 ? 'low' : 'adequate';

                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-xl border-2 ${
                            status === 'out-of-stock' ? 'border-red-300 bg-red-50' :
                            status === 'critical' ? 'border-orange-300 bg-orange-50' :
                            status === 'low' ? 'border-yellow-300 bg-yellow-50' :
                            'border-green-300 bg-green-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                                status === 'critical' ? 'bg-orange-100 text-orange-800' :
                                status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {status === 'out-of-stock' ? 'Out of Stock' :
                                 status === 'critical' ? 'Critical' :
                                 status === 'low' ? 'Low Stock' : 'Adequate'}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingItem(editingItem === item.name ? null : item.name)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>

                          {editingItem === item.name ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Quantity:</span>
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => handleQuickUpdate(item.name, -1)}
                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={currentQty}
                                    onChange={(e) => setInputs(prev => ({ 
                                      ...prev, 
                                      [item.name]: Number(e.target.value) 
                                    }))}
                                    className="w-20 border border-gray-300 rounded-lg px-3 py-1 text-center focus:ring-2 focus:ring-green-500"
                                  />
                                  <button
                                    onClick={() => handleQuickUpdate(item.name, 1)}
                                    className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-gray-900">{currentQty}</span>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">in stock</p>
                                <p className="text-xs text-gray-500">
                                  {currentQty === 0 ? 'Reorder needed' : 
                                   currentQty < 5 ? 'Low inventory' : 
                                   'Stock adequate'}
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  <CheckCircle size={18} />
                  <span>Save All Changes</span>
                </button>
                <button
                  onClick={handleDispense}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  <ShoppingCart size={18} />
                  <span>Dispense Stock</span>
                </button>
                <button
                  onClick={fetchAlerts}
                  className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold"
                >
                  <AlertTriangle size={18} />
                  <span>Refresh Alerts</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Alerts Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 h-fit sticky top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
                <AlertTriangle className="text-orange-500" size={24} />
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
                  <p className="text-gray-600">No active alerts</p>
                  <p className="text-sm text-gray-400">All stock levels are adequate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <p className="font-medium text-red-800">{alert.medicine}</p>
                          <p className="text-sm text-red-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-red-500 mt-2">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Alert Summary */}
              {alerts.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Alerts:</span>
                    <span className="font-semibold text-red-600">{alerts.length}</span>
                  </div>
                  <button
                    onClick={() => {
                      // Mark all alerts as read
                      fetchAlerts();
                    }}
                    className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Mark All as Read
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}