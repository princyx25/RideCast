import { KPICardData } from '../types';

interface KPICardProps {
  data: KPICardData;
}

const KPICard = ({ data }: KPICardProps) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary-blue/30 transition-all hover:shadow-lg hover:shadow-primary-blue/10">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium">{data.title}</p>
          <p className="text-3xl font-bold mt-2 text-white">{data.value}</p>
        </div>
        <div className={`p-3 rounded-xl text-2xl ${data.trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          {data.icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-sm font-bold px-2 py-1 rounded-lg ${data.trend === 'up' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {data.trend === 'up' ? '↗' : '↘'} {data.change}
        </span>
        <span className="text-gray-500 text-sm">vs last week</span>
      </div>
    </div>
  );
};

export default KPICard;
