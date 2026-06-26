export interface PredictionInput {
  pickupLocation: string;
  hour: number;
  dayOfWeek: number;
  weather: string;
  eventFlag: boolean;
}

export interface PredictionResult {
  demandScore: number;
  demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  surgeMultiplier: number;
  timestamp: string;
}

export interface KPICardData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}
