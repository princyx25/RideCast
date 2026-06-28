export interface PredictionInput {
  city: string;
  temperature: number;
  weather: string;
  localTime: string;
  holiday: boolean;
  weekend: boolean;
}

export interface PredictionResult {
  demandScore: number;
  demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  surgeMultiplier: number;
  recommendedDrivers: number;
  revenueEstimate: string;
  explanation: string;
  timestamp?: string;
  zoneId?: string;
}

export interface PredictionHistoryItem {
  id: number;
  city: string;
  temperature: number;
  weather: string;
  localTime: string;
  holiday: boolean;
  weekend: boolean;
  demandScore: number;
  demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  surgeMultiplier: number;
  recommendedDrivers: number;
  revenueEstimate: string;
  explanation: string;
  createdAt: string;
  zoneId?: string;
}

export interface AnalyticsData {
  totalPredictions: number;
  avgDemandScore: number;
  avgSurgeMultiplier: number;
  highDemandCount: number;
  hourlyDemand: Array<{
    hour: string;
    demand: number;
    surge: number;
  }>;
  weeklyDemand: Array<{
    day: string;
    demand: number;
    rides: number;
  }>;
  weatherImpact: Array<{
    weather: string;
    avgDemand: number;
    impact: string;
  }>;
}

export interface KPICardData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

export interface ZoneData {
  id: string;
  name: string;
  demandScore: number;
  demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  surgeMultiplier: number;
  activeDrivers: number;
  activeRides: number;
  x: number;
  y: number;
  radius: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export interface BatchPredictionRow {
  id: string;
  zoneId: string;
  hour: number;
  dayOfWeek: number;
  weather: string;
  temperature: number;
  eventFlag: boolean;
  holidayFlag: boolean;
  result?: PredictionResult;
}
