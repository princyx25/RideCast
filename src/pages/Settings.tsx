
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const { addNotification } = useNotification();
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [notifications, setNotifications] = useState({
    demandAlerts: true,
    surgeAlerts: true,
    weeklyReports: false,
  });

  const handleSave = () => {
    addNotification('success', 'Settings Saved!', 'Your preferences have been updated');
  };

  const themeOptions = [
    { value: 'dark', label: 'Dark', bgClass: 'bg-slate-900' },
    { value: 'light', label: 'Light', bgClass: 'bg-slate-100' },
    { value: 'midnight', label: 'Midnight', bgClass: 'bg-slate-950' },
    { value: 'system', label: 'System', bgClass: 'bg-gradient-to-r from-slate-900 to-slate-100' },
  ];

  const accentOptions = [
    { value: 'blue-purple', colors: ['#3b82f6', '#8b5cf6'] },
    { value: 'green-teal', colors: ['#10b981', '#14b8a6'] },
    { value: 'orange-red', colors: ['#f97316', '#ef4444'] },
    { value: 'pink-purple', colors: ['#ec4899', '#8b5cf6'] },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Profile</h2>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full flex items-center justify-center text-4xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-4 gap-4">
                  {themeOptions.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === t.value
                          ? 'border-primary-blue bg-primary-blue/10'
                          : 'border-dark-border bg-dark-bg hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-full h-16 rounded-lg mb-2 ${t.bgClass}`} />
                      <p className="text-white font-medium capitalize">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Accent Color</label>
                <div className="grid grid-cols-4 gap-4">
                  {accentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAccent(opt.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        accent === opt.value
                          ? 'border-primary-blue bg-primary-blue/10'
                          : 'border-dark-border bg-dark-bg hover:border-gray-600'
                      }`}
                    >
                      <div
                        className="w-full h-16 rounded-lg mb-2 bg-gradient-to-r"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${opt.colors[0]}, ${opt.colors[1]})`,
                        }}
                      />
                      <p className="text-white font-medium capitalize">
                        {opt.value.replace('-', ' ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'demandAlerts', label: 'Demand Alerts', desc: 'Notify when demand spikes' },
                { key: 'surgeAlerts', label: 'Surge Pricing Alerts', desc: 'Notify when surge > 1.5x' },
                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Email weekly summary' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-4 bg-dark-bg rounded-xl cursor-pointer">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="w-6 h-6 accent-primary-blue rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">API Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Base URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                />
              </div>
              <p className="text-gray-500 text-sm">
                Enter your FastAPI backend URL. Default: http://localhost:8000
              </p>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('ridecast_tour_completed');
                  addNotification('success', 'Tutorial Reset!', 'You can now restart the tutorial from Dashboard!');
                }}
                className="w-full bg-dark-bg text-gray-400 hover:text-white font-medium py-3 px-6 rounded-lg border border-dark-border transition-all"
              >
                Restart Tutorial
              </button>
              <button className="w-full bg-dark-bg text-gray-400 hover:text-white font-medium py-3 px-6 rounded-lg border border-dark-border transition-all">
                Export Data
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 border border-primary-blue/30 rounded-2xl p-6">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-white font-bold text-lg mb-2">Pro Tip</h3>
            <p className="text-gray-400 text-sm">
              For best results, combine predictions with real-time traffic data and event calendars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

