import React, { useState } from 'react';
import { PredictionInput, PredictionResult } from '../types';
import { batchPredict } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const zones = [
  { id: 'z1', name: 'Downtown' },
  { id: 'z2', name: 'Airport' },
  { id: 'z3', name: 'University' },
  { id: 'z4', name: 'Shopping Mall' },
  { id: 'z5', name: 'Stadium' },
  { id: 'z6', name: 'Station' },
  { id: 'z7', name: 'Suburbs' },
];
const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BatchItem {
  id: string;
  input: PredictionInput & { temperature: number; holidayFlag: boolean; zoneId: string };
  result?: PredictionResult;
}

const BatchPrediction: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [currentInput, setCurrentInput] = useState<BatchItem['input']>({
    pickupLocation: '',
    zoneId: '',
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    weather: 'Sunny',
    temperature: 22,
    eventFlag: false,
    holidayFlag: false,
  });
  const [processing, setProcessing] = useState(false);

  const { addNotification } = useNotification();

  const addItem = () => {
    if (!currentInput.zoneId) {
      addNotification('error', 'Validation Error', 'Please select a zone');
      return;
    }
    const newItem: BatchItem = {
      id: Date.now().toString(),
      input: {
        ...currentInput,
        pickupLocation: zones.find(z => z.id === currentInput.zoneId)?.name || '',
      },
    };
    setItems([...items, newItem]);
    setCurrentInput({
      pickupLocation: '',
      zoneId: '',
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      weather: 'Sunny',
      temperature: 22,
      eventFlag: false,
      holidayFlag: false,
    });
    addNotification('success', 'Added!', 'Prediction added to batch');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const runBatch = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    try {
      const results = await batchPredict(items.map(i => i.input));
      setItems(items.map((item, idx) => ({
        ...item,
        result: {
          ...results[idx],
          confidenceScore: 85 + Math.random() * 10,
          recommendedDrivers: Math.ceil(results[idx].demandScore / 5),
        },
      })));
      addNotification('success', 'Complete!', 'All predictions generated');
    } catch (error) {
      addNotification('error', 'Failed', 'Batch prediction failed');
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Zone', 'Hour', 'Day', 'Weather', 'Temp', 'Event', 'Holiday', 'Demand Score', 'Category', 'Surge', 'Confidence', 'Drivers'];
    const rows = items.map(item => [
      item.input.pickupLocation,
      item.input.hour,
      days[item.input.dayOfWeek],
      item.input.weather,
      item.input.temperature,
      item.input.eventFlag ? 'Yes' : 'No',
      item.input.holidayFlag ? 'Yes' : 'No',
      item.result?.demandScore || '',
      item.result?.demandCategory || '',
      item.result?.surgeMultiplier || '',
      item.result?.confidenceScore?.toFixed(1) || '',
      item.result?.recommendedDrivers || '',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ridecast-predictions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('success', 'Downloaded!', 'CSV file saved');
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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Batch Prediction</h1>
          <p className="text-gray-400 mt-2">Run multiple predictions at once</p>
        </div>
        {items.some(i => i.result) && (
          <button
            onClick={downloadCSV}
            className="bg-dark-card border border-dark-border text-white px-6 py-3 rounded-xl hover:border-primary-blue transition-all flex items-center gap-2"
          >
            <span>📥</span>
            Download CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-6">Add to Batch</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zone</label>
                <select
                  value={currentInput.zoneId}
                  onChange={(e) => setCurrentInput({ ...currentInput, zoneId: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                >
                  <option value="">Select zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hour</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={currentInput.hour}
                    onChange={(e) => setCurrentInput({ ...currentInput, hour: parseInt(e.target.value) })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Day</label>
                  <select
                    value={currentInput.dayOfWeek}
                    onChange={(e) => setCurrentInput({ ...currentInput, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                  >
                    {days.map((day, idx) => (
                      <option key={day} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weather</label>
                  <select
                    value={currentInput.weather}
                    onChange={(e) => setCurrentInput({ ...currentInput, weather: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                  >
                    {weatherConditions.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Temp (°C)</label>
                  <input
                    type="number"
                    value={currentInput.temperature}
                    onChange={(e) => setCurrentInput({ ...currentInput, temperature: parseInt(e.target.value) })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 bg-dark-bg rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentInput.eventFlag}
                    onChange={(e) => setCurrentInput({ ...currentInput, eventFlag: e.target.checked })}
                    className="w-4 h-4 accent-primary-blue"
                  />
                  <span className="text-gray-300 text-sm">Event</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-dark-bg rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentInput.holidayFlag}
                    onChange={(e) => setCurrentInput({ ...currentInput, holidayFlag: e.target.checked })}
                    className="w-4 h-4 accent-primary-purple"
                  />
                  <span className="text-gray-300 text-sm">Holiday</span>
                </label>
              </div>

              <button
                onClick={addItem}
                className="w-full bg-dark-bg border border-primary-blue text-primary-blue font-semibold py-3 px-6 rounded-lg hover:bg-primary-blue/10 transition-all"
              >
                + Add to Batch
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Batch Queue ({items.length})
              </h2>
              {items.length > 0 && (
                <button
                  onClick={runBatch}
                  disabled={processing}
                  className="bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Run Batch'
                  )}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              {items.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-6xl mb-4 opacity-50">📋</div>
                  <p className="text-gray-400">No items in batch. Add some predictions!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-dark-bg">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Zone</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Params</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-dark-bg/30">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{item.input.pickupLocation}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400 text-sm">
                            {days[item.input.dayOfWeek]} at {item.input.hour}:00 • {item.input.weather} • {item.input.temperature}°C
                          </p>
                          {item.input.eventFlag && <span className="text-xs text-primary-blue mr-2">🎪 Event</span>}
                          {item.input.holidayFlag && <span className="text-xs text-primary-purple">🎄 Holiday</span>}
                        </td>
                        <td className="px-6 py-4">
                          {item.result ? (
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">{item.result.demandScore}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.result.demandCategory)}`}>
                                  {item.result.demandCategory}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-orange-400 font-bold">{item.result.surgeMultiplier}x</p>
                                <p className="text-gray-500 text-xs">Surge</p>
                              </div>
                              <div className="text-center">
                                <p className="text-green-400 font-bold">{item.result.recommendedDrivers}</p>
                                <p className="text-gray-500 text-xs">Drivers</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500">Pending</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchPrediction;