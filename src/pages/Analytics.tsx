
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { getAnalytics } from '../services/api';
import { AnalyticsData } from '../types';

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalytics();
        setAnalyticsData(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-card rounded w-1/3" />
          <div className="h-96 bg-dark-card rounded-2xl" />
        </div>
      </div>
    );
  }

  const defaultHourlyData = [
    { hour: '00:00', demand: 35, surge: 1.2 },
    { hour: '04:00', demand: 20, surge: 1.0 },
    { hour: '08:00', demand: 85, surge: 2.1 },
    { hour: '12:00', demand: 60, surge: 1.5 },
    { hour: '16:00', demand: 75, surge: 1.8 },
    { hour: '20:00', demand: 90, surge: 2.3 },
    { hour: '23:00', demand: 45, surge: 1.3 },
  ];

  const defaultWeeklyData = [
    { day: 'Mon', demand: 65, rides: 260 },
    { day: 'Tue', demand: 58, rides: 232 },
    { day: 'Wed', demand: 72, rides: 288 },
    { day: 'Thu', demand: 78, rides: 312 },
    { day: 'Fri', demand: 92, rides: 368 },
    { day: 'Sat', demand: 88, rides: 352 },
    { day: 'Sun', demand: 60, rides: 240 },
  ];

  const defaultWeatherImpact = [
    { weather: 'Clear', avgDemand: 50, impact: 'Low' },
    { weather: 'Clouds', avgDemand: 60, impact: 'Medium' },
    { weather: 'Rain', avgDemand: 80, impact: 'High' },
    { weather: 'Drizzle', avgDemand: 75, impact: 'High' },
  ];

  const hourlyData = analyticsData?.hourlyDemand.length ? analyticsData.hourlyDemand : defaultHourlyData;
  const weeklyData = analyticsData?.weeklyDemand.length ? analyticsData.weeklyDemand : defaultWeeklyData;
  const weatherImpact = analyticsData?.weatherImpact.length ? analyticsData.weatherImpact : defaultWeatherImpact;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-2">Detailed demand analysis and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Predictions</p>
          <p className="text-3xl font-bold text-white">{analyticsData?.totalPredictions || 0}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">Avg Demand Score</p>
          <p className="text-3xl font-bold text-primary-blue">{analyticsData?.avgDemandScore || 0}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">High/Very High</p>
          <p className="text-3xl font-bold text-orange-400">{analyticsData?.highDemandCount || 0}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">Avg Surge</p>
          <p className="text-3xl font-bold text-green-400">{analyticsData?.avgSurgeMultiplier || 0}x</p>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {weatherImpact.map((item, index) => (
            <div key={index} className="bg-dark-bg rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">
                {item.weather.includes('Clear') && '☀️'}
                {item.weather.includes('Cloud') && '☁️'}
                {item.weather.includes('Rain') || item.weather.includes('Drizzle') && '🌧️'}
                {item.weather.includes('Snow') && '❄️'}
                {!item.weather.includes('Clear') && !item.weather.includes('Cloud') && !item.weather.includes('Rain') && !item.weather.includes('Drizzle') && !item.weather.includes('Snow') && '🌤️'}
              </div>
              <p className="text-white font-medium">{item.weather}</p>
              <p className="text-gray-500 text-sm">{item.impact} Impact</p>
              <p className="text-primary-blue text-lg font-bold mt-2">Avg: {item.avgDemand || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
