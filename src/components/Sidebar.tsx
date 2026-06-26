import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/prediction', label: 'Predict Demand', icon: '🔮' },
    { to: '/batch', label: 'Batch Prediction', icon: '📋' },
    { to: '/history', label: 'History', icon: '🕒' },
  ];

  return (
    <div className="w-64 bg-dark-card border-r border-dark-border flex flex-col">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
          RideCast
        </h1>
        <p className="text-gray-400 text-sm mt-1">Demand Prediction Platform</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 text-white border border-primary-blue/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-dark-border">
        <div className="text-xs text-gray-500">
          <p>© 2024 RideCast</p>
          <p className="mt-1">FastAPI Integration Ready</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
