import { useState } from 'react';
import { PredictionInput, PredictionResult } from '../types';
import { batchPredict } from '../services/api';

const BatchPrediction = () => {
  const [inputs, setInputs] = useState<PredictionInput[]>([]);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState<PredictionInput>({
    pickupLocation: '',
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    weather: 'Sunny',
    eventFlag: false,
  });

  const locations = ['Downtown', 'Airport', 'University', 'Shopping Mall', 'Stadium', 'Station'];
  const weathers = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const addInput = () => {
    if (currentInput.pickupLocation) {
      setInputs([...inputs, { ...currentInput }]);
      setCurrentInput({
        pickupLocation: '',
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        weather: 'Sunny',
        eventFlag: false,
      });
    }
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const runBatchPrediction = async () => {
    if (inputs.length === 0) return;
    setLoading(true);
    try {
      const batchResults = await batchPredict(inputs);
      setResults(batchResults);
    } catch (error) {
      console.error('Batch prediction failed:', error);
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
        <h1 className="text-3xl font-bold text-white">Batch Prediction</h1>
        <p className="text-gray-400 mt-2">Run predictions for multiple locations at once</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Add Prediction Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Pickup Location</label>
                <select
                  value={currentInput.pickupLocation}
                  onChange={(e) => setCurrentInput({ ...currentInput, pickupLocation: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
                >
                  <option value="">Select location...</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Hour</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={currentInput.hour}
                    onChange={(e) => setCurrentInput({ ...currentInput, hour: parseInt(e.target.value) })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Day</label>
                  <select
                    value={currentInput.dayOfWeek}
                    onChange={(e) => setCurrentInput({ ...currentInput, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
                  >
                    {days.map((day, index) => (
                      <option key={day} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Weather</label>
                  <select
                    value={currentInput.weather}
                    onChange={(e) => setCurrentInput({ ...currentInput, weather: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-colors"
                  >
                    {weathers.map((weather) => (
                      <option key={weather} value={weather}>{weather}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input
                    type="checkbox"
                    id="batchEventFlag"
                    checked={currentInput.eventFlag}
                    onChange={(e) => setCurrentInput({ ...currentInput, eventFlag: e.target.checked })}
                    className="w-5 h-5 accent-primary-blue"
                  />
                  <label htmlFor="batchEventFlag" className="text-gray-300 font-medium">Special Event</label>
                </div>
              </div>
              <button
                onClick={addInput}
                disabled={!currentInput.pickupLocation}
                className="w-full bg-dark-bg border border-primary-blue text-primary-blue font-semibold py-3 px-6 rounded-lg hover:bg-primary-blue/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add to Batch
              </button>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Batch Queue ({inputs.length})</h2>
              {inputs.length > 0 && (
                <button
                  onClick={runBatchPrediction}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Running...' : 'Run Batch'}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {inputs.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-dark-bg rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{item.pickupLocation}</p>
                    <p className="text-gray-500 text-sm">{days[item.dayOfWeek]} at {item.hour}:00 • {item.weather}</p>
                  </div>
                  <button
                    onClick={() => removeInput(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {inputs.length === 0 && (
                <p className="text-gray-500 text-center py-8">No items in batch queue</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Results</h2>
          {results.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="bg-dark-bg rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium">{inputs[index]?.pickupLocation || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.demandCategory)}`}>
                      {result.demandCategory}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-xs">Demand Score</p>
                      <p className="text-lg font-bold text-white">{result.demandScore}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Surge Multiplier</p>
                      <p className="text-lg font-bold text-white">{result.surgeMultiplier}x</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-400">Run a batch prediction to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPrediction;
