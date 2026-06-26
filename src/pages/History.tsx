import { useState, useEffect } from 'react';
import { PredictionResult } from '../types';
import { getPredictionHistory } from '../services/api';

const History = () => {
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getPredictionHistory();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Low': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/20';
      case 'Very High': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Prediction History</h1>
        <p className="text-gray-400 mt-2">View past demand predictions</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-bg">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Demand Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Surge Multiplier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {history.map((item, index) => (
                <tr key={index} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-white">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-dark-bg rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-blue to-primary-purple h-2 rounded-full"
                          style={{ width: `${item.demandScore}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium">{item.demandScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.demandCategory)}`}>
                      {item.demandCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium text-lg">{item.surgeMultiplier}x</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
