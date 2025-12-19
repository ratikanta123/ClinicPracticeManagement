import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Calendar, LayoutDashboard, Users, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
      active 
        ? 'bg-primary-50 text-primary-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} className={`mr-3 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex flex-col">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="text-xl font-bold text-gray-800">HealthPulse</span>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {user.role === 'PATIENT' && (
            <>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
              <NavItem to="/book" icon={Calendar} label="Book Appointment" active={isActive('/book')} />
              <NavItem to="/my-appointments" icon={Activity} label="My Appointments" active={isActive('/my-appointments')} />
            </>
          )}

          {user.role === 'DOCTOR' && (
            <>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
              <NavItem to="/schedule" icon={Calendar} label="My Schedule" active={isActive('/schedule')} />
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
              <NavItem to="/admin/appointments" icon={Calendar} label="All Appointments" active={isActive('/admin/appointments')} />
              <NavItem to="/admin/doctors" icon={Users} label="Manage Doctors" active={isActive('/admin/doctors')} />
              <NavItem to="/admin/patients" icon={Users} label="Manage Patients" active={isActive('/admin/patients')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-3">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-gray-800">HealthPulse</span>
        <button onClick={logout} className="text-gray-500"><LogOut size={20}/></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};