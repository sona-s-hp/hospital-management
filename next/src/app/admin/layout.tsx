'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Microscope, 
  Pill, 
  Scan, 
  UserCheck, 
  Calendar,
  Package,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Doctors", path: "/admin/doctors", icon: Stethoscope },
    { name: "Admin Staff", path: "/admin/AdminStaff", icon: Users },
    { name: "Labs", path: "/admin/labs", icon: Microscope },
    { name: "Pharmacy", path: "/admin/pharmacy", icon: Pill },
    { name: "Radiology", path: "/admin/radiology", icon: Scan },
    { name: "Patients", path: "/admin/patients", icon: UserCheck },
    { name: "Doctor Leave", path: "/admin/doctorleave", icon: Calendar },
    { name: "Pharmacy Stock", path: "/admin/pharmacystock", icon: Package },
    { name: "Discharge Summary", path: "/admin/discharge", icon: FileText },
    { name: "Analytics", path: "/admin/logs", icon: BarChart3 },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 text-white 
        transform transition-all duration-500 ease-out
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r border-white/10
      `}>
        {/* Sidebar Header with Glass Effect */}
        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">ZC</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Zane Care
                </h1>
                <p className="text-cyan-200/80 text-sm font-light">Medical Excellence</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <X size={20} className="text-cyan-200" />
            </button>
          </div>
        </div>

        {/* Navigation with Enhanced Design */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group relative flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 
                  transform hover:scale-105 hover:shadow-2xl
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Animated Background Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${isActive ? 'opacity-10' : ''}`}></div>
                
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg' 
                    : 'bg-white/5 group-hover:bg-cyan-500/20'
                }`}>
                  <Icon size={20} className={isActive ? 'text-white' : 'text-cyan-200 group-hover:text-white'} />
                </div>
                
                <span className={`font-semibold transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-cyan-100 group-hover:text-white'
                }`}>
                  {item.name}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Enhanced Logout Section */}
        <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-xl">
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <LogOut size={18} className="group-hover:animate-pulse" />
            <span className="font-semibold">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm z-30">
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Menu size={20} className="text-gray-700" />
              </button>
              
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients, doctors, reports..."
                  className="pl-12 pr-4 py-3 w-80 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                />
              </div>
            </div>
            
            {/* Header Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <Bell size={20} className="text-gray-600 group-hover:text-cyan-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              
              {/* Settings */}
              <button className="p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <Settings size={20} className="text-gray-600 group-hover:text-cyan-600" />
              </button>
              
              {/* User Profile */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-gray-800">Admin User</p>
                    <p className="text-sm text-gray-500">Super Administrator</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 group-hover:text-cyan-600" />
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-16 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-5">
                    <div className="p-4 border-b border-gray-200/50">
                      <p className="font-semibold text-gray-800">Admin User</p>
                      <p className="text-sm text-gray-500">admin@zanecare.com</p>
                    </div>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50/80 transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50/80 transition-colors">
                      Security
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50/80 transition-colors border-t border-gray-200/50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Enhanced Background */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}