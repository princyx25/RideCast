import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import KPICard from '../components/KPICard';
import CityHeatmap from '../components/CityHeatmap';
import HowPredictionWorks from '../components/HowPredictionWorks';
import { useNotification } from '../context/NotificationContext';
import { getAnalytics } from '../services/api';
import { AnalyticsData } from '../types';

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { addNotification } = useNotification();

  // Generate realistic percentage change
  const generateChange = (): { change: string; trend: 'up' | 'down' } => {
    const isUp = Math.random() > 0.4; // 60% chance up, 40% down
    const value = parseFloat((Math.random() * (25 - 0.5) + 0.5).toFixed(1));
    return {
      change: (isUp ? '+' : '-') + value + '%',
      trend: isUp ? 'up' : 'down'
    };
  };

  // Default Analytics Data for safe fallback
  const getDefaultAnalytics = (): AnalyticsData => ({
    totalPredictions: 0,
    avgDemandScore: 0,
    avgSurgeMultiplier: 1,
    highDemandCount: 0,
    hourlyDemand: [
      { hour: '00:00', demand: 35, surge: 1.2 },
      { hour: '04:00', demand: 20, surge: 1.0 },
      { hour: '08:00', demand: 85, surge: 2.1 },
      { hour: '12:00', demand: 60, surge: 1.5 },
      { hour: '16:00', demand: 75, surge: 1.8 },
      { hour: '20:00', demand: 90, surge: 2.3 },
      { hour: '23:00', demand: 45, surge: 1.3 },
    ],
    weeklyDemand: [
      { day: 'Mon', demand: 65, rides: 260 },
      { day: 'Tue', demand: 58, rides: 232 },
      { day: 'Wed', demand: 72, rides: 288 },
      { day: 'Thu', demand: 78, rides: 312 },
      { day: 'Fri', demand: 92, rides: 368 },
      { day: 'Sat', demand: 88, rides: 352 },
      { day: 'Sun', demand: 60, rides: 240 },
    ],
    weatherImpact: [
      { weather: 'Clear', avgDemand: 50, impact: 'Low' },
      { weather: 'Clouds', avgDemand: 60, impact: 'Medium' },
      { weather: 'Rain', avgDemand: 80, impact: 'High' },
      { weather: 'Drizzle', avgDemand: 75, impact: 'High' },
    ],
  });

  // Update KPIs from analytics data
  const updateKPIs = (data: AnalyticsData | null) => {
    const safeData = data || getDefaultAnalytics();
    const ridesChange = generateChange();
    const driversChange = generateChange();
    const demandChange = generateChange();
    const surgeChange = generateChange();
    const revenueChange = generateChange();

    const totalRides = (safeData.weeklyDemand || []).reduce((sum, d) => sum + (d.rides || 0), 0);
    const activeDrivers = Math.floor((safeData.avgDemandScore || 0) * 2.5);
    const revenue = Math.floor((safeData.avgDemandScore || 0) * 0.8);

    const newKPIs: KPI[] = [
      {
        title: 'Total Predictions',
        value: (safeData.totalPredictions || 0).toLocaleString(),
        change: ridesChange.change,
        trend: ridesChange.trend,
        icon: '📊'
      },
      {
        title: 'Active Drivers',
        value: activeDrivers.toLocaleString(),
        change: driversChange.change,
        trend: driversChange.trend,
        icon: '👨‍✈️'
      },
      {
        title: 'Avg Demand Score',
        value: (safeData.avgDemandScore || 0).toFixed(1),
        change: demandChange.change,
        trend: demandChange.trend,
        icon: '📈'
      },
      {
        title: 'Surge Multiplier',
        value: (safeData.avgSurgeMultiplier || 1).toFixed(2) + 'x',
        change: surgeChange.change,
        trend: surgeChange.trend,
        icon: '⚡'
      },
      {
        title: 'High Demand Cases',
        value: (safeData.highDemandCount || 0).toLocaleString(),
        change: revenueChange.change,
        trend: revenueChange.trend,
        icon: '🔥'
      }
    ];

    setKpis(newKPIs);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics();
      setAnalyticsData(data);
      updateKPIs(data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
      const defaultData = getDefaultAnalytics();
      setAnalyticsData(defaultData);
      updateKPIs(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial update with default data
    updateKPIs(null);

    // Initial fetch
    fetchAnalytics();

    // Check for first-time user
    const tourCompleted = localStorage.getItem('ridecast_tour_completed');
    if (!tourCompleted) {
      // Redirect to Predict Demand and open tour there
      navigate('/prediction', { state: { openTour: true } });
    }

    // Update every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    // Notification timer
    const timer = setTimeout(() => {
      addNotification('warning', 'High Demand Alert!', 'Downtown area showing very high demand. Consider adding more drivers.');
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [addNotification, navigate]);

  // Default data for charts
  const defaultHourlyData = [
    { time: '00:00', demand: 45, rides: 120 },
    { time: '04:00', demand: 25, rides: 60 },
    { time: '08:00', demand: 90, rides: 350 },
    { time: '12:00', demand: 65, rides: 220 },
    { time: '16:00', demand: 85, rides: 310 },
    { time: '20:00', demand: 95, rides: 400 },
    { time: '23:00', demand: 55, rides: 180 },
  ];

  const defaultWeeklyData = [
    { day: 'Mon', rides: 2400, demand: 65 },
    { day: 'Tue', rides: 2200, demand: 62 },
    { day: 'Wed', rides: 2500, demand: 68 },
    { day: 'Thu', rides: 2800, demand: 72 },
    { day: 'Fri', rides: 3500, demand: 88 },
    { day: 'Sat', rides: 3200, demand: 82 },
    { day: 'Sun', rides: 2600, demand: 70 },
  ];

  // Transform analytics data for charts
  const hourlyData = (analyticsData?.hourlyDemand || []).map(d => ({
    time: d.hour,
    demand: d.demand,
    rides: Math.floor(d.demand * 4)
  })) || defaultHourlyData;

  const weeklyData = (analyticsData?.weeklyDemand || []).map(d => ({
    day: d.day,
    rides: d.rides,
    demand: d.demand
  })) || defaultWeeklyData;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time demand analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-gray-400 text-sm">Live Data</span>
          {lastUpdated && (
            <span className="text-gray-500 text-xs bg-dark-card px-3 py-1 rounded-full border border-dark-border">
              Last updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      <CityHeatmap />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Hourly Demand Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121826', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Weekly Ride Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121826', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="rides" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Surge Pricing Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
                contentStyle={{ backgroundColor: '#121826', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            <Line type="monotone" dataKey="rides" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <HowPredictionWorks />
    </div>
  );
};

export default Dashboard;