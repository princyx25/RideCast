import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const Analytics = () => {
  const hourlyData = [
    { hour: '00:00', demand: 35, surge: 1.2 },
    { hour: '04:00', demand: 20, surge: 1.0 },
    { hour: '08:00', demand: 85, surge: 2.1 },
    { hour: '12:00', demand: 60, surge: 1.5 },
    { hour: '16:00', demand: 75, surge: 1.8 },
    { hour: '20:00', demand: 90, surge: 2.3 },
    { hour: '23:00', demand: 45, surge: 1.3 },
  ];

  const weeklyData = [
    { day: 'Mon', demand: 65, events: 2 },
    { day: 'Tue', demand: 58, events: 0 },
    { day: 'Wed', demand: 72, events: 1 },
    { day: 'Thu', demand: 78, events: 3 },
    { day: 'Fri', demand: 92, events: 5 },
    { day: 'Sat', demand: 88, events: 4 },
    { day: 'Sun', demand: 60, events: 1 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-2">Detailed demand analysis and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Hourly Demand Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121826', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="surge" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Weekly Demand</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121826', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Weather Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { weather: 'Sunny', impact: 'Low', color: 'text-yellow-400' },
            { weather: 'Cloudy', impact: 'Medium', color: 'text-gray-400' },
            { weather: 'Rainy', impact: 'High', color: 'text-blue-400' },
            { weather: 'Snowy', impact: 'Very High', color: 'text-cyan-400' },
          ].map((item, index) => (
            <div key={index} className="bg-dark-bg rounded-lg p-4 text-center">
              <div className={`text-4xl mb-2 ${item.color}`}>
                {item.weather === 'Sunny' && '☀️'}
                {item.weather === 'Cloudy' && '☁️'}
                {item.weather === 'Rainy' && '🌧️'}
                {item.weather === 'Snowy' && '❄️'}
              </div>
              <p className="text-white font-medium">{item.weather}</p>
              <p className="text-gray-500 text-sm">{item.impact} Impact</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
