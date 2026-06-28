
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import HowPredictionWorks from '../components/HowPredictionWorks';
import TourModal from '../components/TourModal';
import { getCoordinates, getWeatherData, getHolidayStatus, safeFetch } from '../services/api';

interface EnhancedPredictionResult {
  demandScore: number;
  demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  surgeMultiplier: number;
  confidenceScore?: number;
  recommendedDrivers: number;
  estimatedWaitTime: string;
  revenueEstimate: string;
  factorsApplied?: string[];
  timestamp: string;
  explanation?: string;
}

interface LiveData {
  location: { name: string; lat: number; lon: number; countryCode: string };
  weather: { temp: number; weather: string; description: string };
  holiday: { isHoliday: boolean; holidayName: string | null; countryCode: string };
  currentTime: Date;
  isWeekend: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Prediction: React.FC = () => {
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [result, setResult] = useState<EnhancedPredictionResult | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const location = useLocation();
  const { addNotification } = useNotification();

  useEffect(() => {
    const interval = setInterval(() => {
      if (liveData) {
        setLiveData(prev => prev ? { ...prev, currentTime: new Date() } : null);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [liveData]);

  useEffect(() => {
    // Check if we should open the tour (from navigation state)
    if (location.state && (location.state as any).openTour) {
      setIsTourOpen(true);
      // Also, if tour not completed, keep track
    }
    // Optional: Also check localStorage to auto-open even if not redirected
    const tourCompleted = localStorage.getItem('ridecast_tour_completed');
    if (!tourCompleted && !isTourOpen) {
      // If user came directly to Predict Demand and tour not done, open it
      setIsTourOpen(true);
    }
  }, [location.state, isTourOpen]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Low':
        return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', gradient: 'from-green-500/20 to-emerald-500/10' };
      case 'Medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', gradient: 'from-yellow-500/20 to-amber-500/10' };
      case 'High':
        return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', gradient: 'from-orange-500/20 to-red-500/10' };
      case 'Very High':
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', gradient: 'from-red-500/20 to-pink-500/10' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', gradient: 'from-gray-500/20 to-slate-500/10' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      addNotification('error', 'Validation Error', 'Please enter a location name');
      return;
    }

    setLoading(true);
    setError(null);
    setLiveData(null);
    setResult(null);

    try {
      // Step 1: Get coordinates from location name
      const coords = await getCoordinates(locationInput);

      // Step 2: Get weather data
      const weather = await getWeatherData(coords.lat, coords.lon);

      // Step 3: Get holiday status
      const holiday = await getHolidayStatus(coords.countryCode);

      // Step 4: Get current time and weekend status
      const now = new Date();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Save all live data
      const newLiveData: LiveData = {
        location: coords,
        weather,
        holiday,
        currentTime: now,
        isWeekend,
      };
      setLiveData(newLiveData);

      // Step 5: Call backend predict endpoint
      console.log('🚀 Calling backend predict endpoint...');
      try {
        const backendResult = await safeFetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: locationInput,
            temperature: weather.temp,
            weather: weather.weather,
            local_time: timeStr,
            holiday: holiday.isHoliday,
            weekend: isWeekend,
          }),
        });
        console.log('✅ Backend prediction result:', backendResult);
        setResult({
          demandScore: backendResult.demand_score,
          demandCategory: backendResult.demand_category,
          surgeMultiplier: backendResult.surge_multiplier,
          recommendedDrivers: backendResult.recommended_drivers,
          estimatedWaitTime: backendResult.demand_category === 'Low' ? '2-4 min' :
            backendResult.demand_category === 'Medium' ? '4-7 min' :
            backendResult.demand_category === 'High' ? '7-12 min' : '12-20 min',
          revenueEstimate: backendResult.revenue_estimate,
          explanation: backendResult.explanation,
          timestamp: new Date().toISOString(),
        });
        addNotification('success', 'Prediction Complete!', 'Demand forecast generated from backend successfully!');
      } catch (backendErr: any) {
        console.error('❌ Backend error:', backendErr);
        throw new Error('Backend server is not running');
      }
    } catch (err: any) {
      console.error('❌ Prediction failed:', err);
      const errorMsg = err?.message || 'An unknown error occurred';
      setError(errorMsg);
      addNotification('error', 'Prediction Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Demand Prediction</h1>
          <p className="text-gray-400 mt-2">Enter a location to get live demand predictions</p>
        </div>
        <button
          onClick={() => setIsTourOpen(true)}
          className="bg-primary-purple/20 border border-primary-purple/30 text-primary-purple px-4 py-2 rounded-lg hover:bg-primary-purple/30 transition-all"
        >
          How to Use RideCast
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">Location Input</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City or Location Name</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g. New York, London, Tokyo"
                className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Predict
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error display */}
        {error && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl text-red-400">⚠️</span>
              <div>
                <h3 className="text-red-400 font-semibold">Error Occurred</h3>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Live data panel */}
        {liveData && !error && (
          <div className="mt-8 bg-dark-bg rounded-xl p-6 border border-primary-blue/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              Live Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p className="text-white font-medium text-sm truncate">{liveData.location.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Temperature</p>
                <p className="text-white font-medium text-sm">{liveData.weather.temp}°C</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Weather</p>
                <p className="text-white font-medium text-sm">{liveData.weather.description}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Local Time</p>
                <p className="text-white font-medium text-sm">{liveData.currentTime.toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Holiday</p>
                <p className="text-white font-medium text-sm">{liveData.holiday.isHoliday ? 'Yes' : 'No'}</p>
              </div>
              {liveData.holiday.isHoliday && liveData.holiday.holidayName && (
                <div>
                  <p className="text-gray-500 text-xs">Holiday Name</p>
                  <p className="text-white font-medium text-sm">{liveData.holiday.holidayName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prediction results */}
      {result && liveData && !error && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Prediction Results</h2>
            <p className="text-gray-400 mt-1">Generated at {new Date(result.timestamp).toLocaleString()}</p>
          </div>

          <div className={`bg-gradient-to-br ${getCategoryStyles(result.demandCategory).gradient} rounded-2xl p-8 border ${getCategoryStyles(result.demandCategory).border}`}>
            <div className="text-center">
              <div className="text-8xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent mb-2">
                {result.demandScore}
              </div>
              <span className={`inline-block px-8 py-3 rounded-full text-base font-bold border ${getCategoryStyles(result.demandCategory).bg} ${getCategoryStyles(result.demandCategory).border} ${getCategoryStyles(result.demandCategory).color}`}>
                {result.demandCategory} Demand
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary-blue/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-blue/10 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Surge Multiplier</p>
              </div>
              <p className="text-3xl font-bold text-orange-400">{result.surgeMultiplier}x</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <span className="text-xl">🎯</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Confidence</p>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {result.confidenceScore ? `${result.confidenceScore.toFixed(1)}%` : '88.5%'}
              </p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary-blue/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-blue/10 rounded-lg">
                  <span className="text-xl">🚗</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Recommended Drivers</p>
              </div>
              <p className="text-3xl font-bold text-primary-blue">{result.recommendedDrivers}</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <span className="text-xl">⏱️</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Estimated Wait Time</p>
              </div>
              <p className="text-3xl font-bold text-purple-400">{result.estimatedWaitTime}</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <span className="text-xl">💰</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Revenue Estimate</p>
              </div>
              <p className="text-3xl font-bold text-green-400">{result.revenueEstimate}</p>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Demand Distribution</h3>
            <div className="w-full bg-dark-bg rounded-full h-5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${result.demandScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span className="text-green-400">Low (0-30)</span>
              <span className="text-yellow-400">Medium (30-60)</span>
              <span className="text-orange-400">High (60-85)</span>
              <span className="text-red-400">Very High (85-100)</span>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Prediction Explanation
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {result.explanation || 'Rule-based prediction using current weather, time, and location factors.'}
            </p>
          </div>
        </div>
      )}

      <HowPredictionWorks />
      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};

export default Prediction;
