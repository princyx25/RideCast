import React, { useState, useEffect } from 'react';
import { ZoneData } from '../types';

interface CityHeatmapProps {
  onZoneClick?: (zone: ZoneData) => void;
}

const CityHeatmap: React.FC<CityHeatmapProps> = ({ onZoneClick }) => {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);

  useEffect(() => {
    const initialZones: ZoneData[] = [
      { id: 'z1', name: 'Downtown', demandScore: 92, demandCategory: 'Very High', surgeMultiplier: 2.5, activeDrivers: 45, activeRides: 120, x: 50, y: 40, radius: 15 },
      { id: 'z2', name: 'Airport', demandScore: 88, demandCategory: 'High', surgeMultiplier: 2.1, activeDrivers: 38, activeRides: 95, x: 20, y: 30, radius: 12 },
      { id: 'z3', name: 'University', demandScore: 76, demandCategory: 'High', surgeMultiplier: 1.8, activeDrivers: 32, activeRides: 78, x: 75, y: 25, radius: 11 },
      { id: 'z4', name: 'Shopping Mall', demandScore: 71, demandCategory: 'Medium', surgeMultiplier: 1.6, activeDrivers: 28, activeRides: 65, x: 45, y: 70, radius: 10 },
      { id: 'z5', name: 'Stadium', demandScore: 85, demandCategory: 'High', surgeMultiplier: 2.0, activeDrivers: 40, activeRides: 88, x: 80, y: 60, radius: 13 },
      { id: 'z6', name: 'Station', demandScore: 68, demandCategory: 'Medium', surgeMultiplier: 1.5, activeDrivers: 25, activeRides: 60, x: 30, y: 55, radius: 9 },
      { id: 'z7', name: 'Suburbs', demandScore: 45, demandCategory: 'Low', surgeMultiplier: 1.1, activeDrivers: 18, activeRides: 35, x: 60, y: 85, radius: 14 },
    ];
    setZones(initialZones);

    const interval = setInterval(() => {
      setZones(prev => prev.map(zone => ({
        ...zone,
        demandScore: Math.max(20, Math.min(100, zone.demandScore + (Math.random() * 10 - 5))),
        surgeMultiplier: Math.max(1.0, Math.min(3.0, zone.surgeMultiplier + (Math.random() * 0.2 - 0.1)))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getZoneColor = (score: number) => {
    if (score < 40) return 'rgba(34, 197, 94, 0.5)';
    if (score < 60) return 'rgba(234, 179, 8, 0.5)';
    if (score < 80) return 'rgba(249, 115, 22, 0.5)';
    return 'rgba(239, 68, 68, 0.5)';
  };

  const getBorderColor = (score: number) => {
    if (score < 40) return '#22c55e';
    if (score < 60) return '#eab308';
    if (score < 80) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">City Demand Heatmap</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <span className="text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500/50" />
            <span className="text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <span className="text-gray-400">Very High</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {zones.map(zone => (
          <div
            key={zone.id}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${
              selectedZone?.id === zone.id ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`
            }}
            onClick={() => {
              setSelectedZone(zone);
              onZoneClick?.(zone);
            }}
          >
            <div
              className="absolute rounded-full animate-pulse-ring"
              style={{
                width: `${zone.radius * 20}px`,
                height: `${zone.radius * 20}px`,
                backgroundColor: getZoneColor(zone.demandScore),
                border: `2px solid ${getBorderColor(zone.demandScore)}`,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%'
              }}
            />
            <div
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: `${zone.radius * 10}px`,
                height: `${zone.radius * 10}px`,
                backgroundColor: getZoneColor(zone.demandScore),
                border: `2px solid ${getBorderColor(zone.demandScore)}`,
                boxShadow: `0 0 20px ${getBorderColor(zone.demandScore)}`
              }}
            >
              <span className="text-white font-bold text-xs">{zone.demandScore}</span>
            </div>
            <p className="text-white text-xs text-center mt-2 font-medium whitespace-nowrap">
              {zone.name}
            </p>
          </div>
        ))}
      </div>

      {selectedZone && (
        <div className="absolute top-20 right-4 bg-dark-card border border-dark-border rounded-xl p-4 w-64 shadow-2xl animate-slide-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold">{selectedZone.name}</h4>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Demand Score</span>
              <span className="text-white font-bold">{selectedZone.demandScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Surge</span>
              <span className="text-orange-400 font-bold">{selectedZone.surgeMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Drivers</span>
              <span className="text-white">{selectedZone.activeDrivers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Rides</span>
              <span className="text-white">{selectedZone.activeRides}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityHeatmap;