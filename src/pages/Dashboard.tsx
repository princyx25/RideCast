import KPICard from '../components/KPICard';
import { KPICardData } from '../types';

const Dashboard = () => {
  const kpiData: KPICardData[] = [
    { title: 'Total Predictions', value: '12,847', change: '+12.5%', trend: 'up' },
    { title: 'Avg Demand Score', value: '68.4', change: '+5.2%', trend: 'up' },
    { title: 'Surge Events', value: '342', change: '-8.3%', trend: 'down' },
    { title: 'Accuracy', value: '94.2%', change: '+2.1%', trend: 'up' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Overview of ride demand predictions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((data, index) => (
          <KPICard key={index} data={data} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 min ago', location: 'Downtown', demand: 'High' },
              { time: '15 min ago', location: 'Airport', demand: 'Very High' },
              { time: '32 min ago', location: 'Suburbs', demand: 'Medium' },
              { time: '1 hour ago', location: 'Stadium', demand: 'Very High' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                <div>
                  <p className="text-white font-medium">{activity.location}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.demand === 'Very High' ? 'bg-red-500/20 text-red-400' :
                  activity.demand === 'High' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {activity.demand}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Locations</h2>
          <div className="space-y-4">
            {[
              { location: 'Central Business District', score: 92 },
              { location: 'International Airport', score: 88 },
              { location: 'University Campus', score: 76 },
              { location: 'Shopping Mall', score: 71 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">{item.location}</span>
                  <span className="text-white font-medium">{item.score}</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-blue to-primary-purple h-2 rounded-full transition-all"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
