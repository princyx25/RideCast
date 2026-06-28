
import React, { useState, useEffect } from 'react';
import { PredictionHistoryItem } from '../types';
import { getPredictionHistory, exportToJSON, exportToCSV } from '../services/api';

const History: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPredictionHistory();
        setHistory(data);
        setFilteredHistory(data);
      } catch (err) {
        setError('Failed to load prediction history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...history];
    
    // Apply search filter
    if (search) {
      result = result.filter(h => 
        h.demandCategory.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply city filter
    if (filterCity) {
      result = result.filter(h => h.city.toLowerCase() === filterCity.toLowerCase());
    }
    
    // Apply category filter
    if (filterCategory) {
      result = result.filter(h => h.demandCategory === filterCategory);
    }
    
    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredHistory(result);
  }, [search, filterCity, filterCategory, sortOrder, history]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Very High': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const uniqueCities = Array.from(new Set(history.map(h => h.city)));
  const uniqueCategories = ['Low', 'Medium', 'High', 'Very High'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-card rounded w-1/3" />
          <div className="h-6 bg-dark-card rounded w-1/4" />
          <div className="h-96 bg-dark-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading History</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Prediction History</h1>
          <p className="text-gray-400 mt-2">View and filter past predictions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToJSON}
            className="bg-primary-blue/20 border border-primary-blue/30 text-primary-blue px-4 py-2 rounded-lg hover:bg-primary-blue/30 transition-all flex items-center gap-2"
          >
            <span>📄</span>
            Export JSON
          </button>
          <button
            onClick={exportToCSV}
            className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all flex items-center gap-2"
          >
            <span>📊</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by city or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Predictions</p>
          <p className="text-3xl font-bold text-white">{history.length}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">Avg Demand Score</p>
          <p className="text-3xl font-bold text-primary-blue">
            {history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.demandScore, 0) / history.length) : 0}
          </p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">High/Very High</p>
          <p className="text-3xl font-bold text-orange-400">
            {history.filter(h => ['High', 'Very High'].includes(h.demandCategory)).length}
          </p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">Avg Surge</p>
          <p className="text-3xl font-bold text-green-400">
            {history.length > 0 ? (history.reduce((sum, h) => sum + h.surgeMultiplier, 0) / history.length).toFixed(2) : '0.00'}x
          </p>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-bg">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">City</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Weather</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Demand Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Surge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-dark-bg/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white">{new Date(item.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-500 text-sm">{new Date(item.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{item.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{item.weather}</p>
                    <p className="text-gray-500 text-sm">{item.temperature.toFixed(1)}°C</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-dark-bg rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-blue to-primary-purple h-2 rounded-full"
                          style={{ width: `${item.demandScore}%` }}
                        />
                      </div>
                      <span className="text-white font-bold">{item.demandScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(item.demandCategory)}`}>
                      {item.demandCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-orange-400 font-bold text-lg">{item.surgeMultiplier}x</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredHistory.length === 0 && history.length === 0 && (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <p className="text-gray-400 text-lg">No predictions yet</p>
            <p className="text-gray-500 mt-2">Start predicting to see history here</p>
          </div>
        )}
        {filteredHistory.length === 0 && history.length > 0 && (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <p className="text-gray-400">No predictions found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
