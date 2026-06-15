import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiHome, FiMonitor, FiCode, FiBarChart2,
  FiUser, FiLogOut, FiChevronLeft, FiChevronRight,
  FiAward, FiMic, FiUpload, FiShield, FiMenu, FiX
} from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/interview/setup', label: 'New Interview', icon: FiMonitor },
  { path: '/interview/voice', label: 'Voice Interview', icon: FiMic },
  { path: '/coding', label: 'Coding Challenges', icon: FiCode },
  { path: '/resume', label: 'Resume Upload', icon: FiUpload },
  { path: '/reports', label: 'Analytics', icon: FiBarChart2 },
  { path: '/leaderboard', label: 'Leaderboard', icon: FiAward },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-gray-100 dark:border-dark-700 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <FiMonitor className="text-white" size={18} />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">AI Interview</h1>
            <p className="text-xs text-primary-500 font-medium">Prep Platform</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={location.pathname === '/admin' ? 'sidebar-link-active' : 'sidebar-link'}
            title={collapsed ? 'Admin Panel' : ''}
          >
            <FiShield size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-100 dark:border-dark-700 space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="sidebar-link w-full text-left"
          title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
        >
          <span className="text-lg flex-shrink-0">{isDark ? '☀️' : '🌙'}</span>
          {!collapsed && <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.avatar ? (
                <img src={`http://localhost:5000${user.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
          <FiLogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse Button (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-6 h-6 absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-full shadow-md hover:shadow-lg transition-all text-gray-500 dark:text-gray-400"
      >
        {collapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn-icon bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 shadow-2xl transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {renderSidebarContent()}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col relative bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default Sidebar;
