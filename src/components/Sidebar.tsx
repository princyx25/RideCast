import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { to: '/prediction', label: 'Predict Demand', icon: '🔮' },
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/batch', label: 'Batch Prediction', icon: '📋' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/history', label: 'History', icon: '🕒' },
    { to: '/knowledge', label: 'Knowledge', icon: '📚' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-dark-card border-r border-dark-border flex flex-col">
      <div className="p-5 border-b border-dark-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
          RideCast
        </h1>
        <p className="text-gray-500 text-xs mt-1">AI Demand Prediction</p>
      </div>
      
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 text-white border border-primary-blue/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-dark-border">
        {user && (
          <div className="relative p-3">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-bg transition-all text-left"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(user.name || 'U')[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user.name || 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{user.email || 'user@example.com'}</p>
              </div>
              <span className="text-gray-500 text-xs">
                {dropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {dropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute bottom-full left-3 right-3 mb-2 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in"
              >
                <button
                  onClick={() => {
                    navigate('/settings');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-bg hover:text-white transition-all"
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <div className="h-px bg-dark-border my-0.5"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
        <div className="px-4 pb-3 text-center">
          <p className="text-gray-700 text-[10px]">© 2024 RideCast</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
