import { KPICardData } from '../types';

interface KPICardProps {
  data: KPICardData;
}

const KPICard = ({ data }: KPICardProps) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary-blue/30 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium">{data.title}</p>
          <p className="text-3xl font-bold mt-2 text-white">{data.value}</p>
        </div>
        <div className={`p-3 rounded-lg ${data.trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <span className={`text-xl ${data.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {data.trend === 'up' ? '↗' : '↘'}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${data.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {data.change}
        </span>
        <span className="text-gray-500 text-sm ml-2">vs last week</span>
      </div>
    </div>
  );
};

export default KPICard;
