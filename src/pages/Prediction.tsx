import { useState } from 'react';
import { PredictionInput, PredictionResult } from '../types';
import { predictDemand } from '../services/api';

const Prediction = () => {
  const [input, setInput] = useState<PredictionInput>({
    pickupLocation: '',
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    weather: 'Sunny',
    eventFlag: false,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const locations = ['Downtown', 'Airport', 'University', 'Shopping Mall', 'Stadium', 'Station'];
  const weathers = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const predictionResult = await predictDemand(input);
      setResult(predictionResult);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Low': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/20';
      case 'Very High': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Predict Demand</h1>
        <p className="text-gray-400 mt-2">Enter parameters to predict ride demand</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Input Parameters</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Pickup Location</label>
              <select
                value={input.pickupLocation}
                onChange={(e) => setInput({ ...input, pickupLocation: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
                required
              >
                <option value="">Select location...</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Hour: {input.hour}:00
              </label>
              <input
                type="range"
                min="0"
                max="23"
                value={input.hour}
                onChange={(e) => setInput({ ...input, hour: parseInt(e.target.value) })}
                className="w-full accent-primary-blue"
              />
              <div className="flex justify-between text-gray-500 text-xs mt-1">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:00</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Day of Week</label>
              <select
                value={input.dayOfWeek}
                onChange={(e) => setInput({ ...input, dayOfWeek: parseInt(e.target.value) })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
              >
                {days.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Weather Condition</label>
              <select
                value={input.weather}
                onChange={(e) => setInput({ ...input, weather: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
              >
                {weathers.map((weather) => (
                  <option key={weather} value={weather}>{weather}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="eventFlag"
                checked={input.eventFlag}
                onChange={(e) => setInput({ ...input, eventFlag: e.target.checked })}
                className="w-5 h-5 accent-primary-blue"
              />
              <label htmlFor="eventFlag" className="text-gray-300 font-medium">Special Event Occurring</label>
            </div>

            <button
              type="submit"
              disabled={loading || !input.pickupLocation}
              className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Predicting...' : 'Predict Demand'}
            </button>
          </form>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Prediction Results</h2>
          {result ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent mb-2">
                  {result.demandScore}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(result.demandCategory)}`}>
                  {result.demandCategory} Demand
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">Surge Multiplier</p>
                  <p className="text-2xl font-bold text-white mt-2">{result.surgeMultiplier}x</p>
                </div>
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">Confidence</p>
                  <p className="text-2xl font-bold text-white mt-2">94%</p>
                </div>
              </div>

              <div className="bg-dark-bg rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Demand Distribution</p>
                <div className="w-full bg-dark-card rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${result.demandScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center text-gray-500 text-sm">
                Generated at {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔮</div>
              <p className="text-gray-400">Enter parameters and click Predict Demand</p>
              <p className="text-gray-500 text-sm mt-2">to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prediction;
