import { PredictionInput, PredictionResult, PredictionHistoryItem, AnalyticsData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

// Helper function to handle fetch responses safely
export const safeFetch = async (url: string, options?: RequestInit) => {
  console.log('📡 Fetching:', url);
  const response = await fetch(url, options);
  console.log('📡 Response status:', response.status, response.statusText);

  // Read response body once
  const text = await response.text();
  console.log('📡 Raw response text:', text);

  if (!response.ok) {
    console.error('❌ Response not ok:', response.status, response.statusText);
    console.error('❌ Error response body:', text);
    throw new Error(`HTTP error: ${response.status}`);
  }

  if (!text) {
    console.error('❌ Empty response body');
    throw new Error('Empty response');
  }

  // Check content type
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error('❌ Not JSON response, content-type:', contentType);
    throw new Error('Response not JSON');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('❌ Failed to parse JSON:', err);
    throw new Error('Invalid JSON');
  }
};

// --- Geocoding with OpenStreetMap Nominatim ---
export const getCoordinates = async (locationName: string) => {
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1&addressdetails=1`;
  console.log('🌍 [Geocoding] Endpoint:', geocodeUrl);

  try {
    const data = await safeFetch(geocodeUrl, {
      headers: { 'User-Agent': 'RideCast/1.0' }
    });
    console.log('✅ [Geocoding] Response:', data);

    if (data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name,
        countryCode: data[0].address?.country_code?.toUpperCase() || 'US'
      };
      console.log('✅ [Geocoding] Coordinates and country found:', coords);
      return coords;
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('❌ [Geocoding] Error:', error);
    throw error;
  }
};

// --- Weather data from OpenWeatherMap ---
export const getWeatherData = async (lat: number, lon: number) => {
  if (!OPENWEATHER_API_KEY) {
    console.error('❌ [Weather] OpenWeatherMap API key is missing!');
    throw new Error('OpenWeatherMap API key is missing. Please set VITE_OPENWEATHER_API_KEY in your environment variables.');
  }

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  console.log('🌤️ [Weather] Endpoint:', weatherUrl);

  try {
    const data = await safeFetch(weatherUrl);
    console.log('✅ [Weather] Raw API response:', data);

    const weatherData = {
      temp: data.main.temp,
      weather: data.weather[0].main,
      description: data.weather[0].description,
    };
    console.log('✅ [Weather] Parsed weather data:', weatherData);

    return weatherData;
  } catch (error) {
    console.error('❌ [Weather] Error:', error);
    throw new Error('Weather API failed');
  }
};

// --- Public holiday check with Nager.Date API ---
export const getHolidayStatus = async (countryCode: string = 'US') => {
  const today = new Date();
  const year = today.getFullYear();
  const holidayUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  console.log('🎉 [Holiday] Endpoint:', holidayUrl);

  try {
    const holidays = await safeFetch(holidayUrl);
    const todayStr = today.toISOString().split('T')[0];
    const holiday = holidays.find((h: any) => h.date === todayStr);
    const isHoliday = !!holiday;
    const holidayName = holiday?.name || null;

    console.log('✅ [Holiday] Response:', { isHoliday, holidayName, countryCode });
    return { isHoliday, holidayName, countryCode };
  } catch (error) {
    console.warn('⚠️ [Holiday] Failed to fetch holiday status, defaulting to no holiday', error);
    // Default to no holiday if API fails
    return { isHoliday: false, holidayName: null, countryCode };
  }
};

// --- Demand Prediction Logic ---
export interface PredictionFactors {
  temperature: number;
  weather: string;
  isHoliday: boolean;
  hour: number;
  isWeekend: boolean;
}

export const calculateDemandPrediction = (factors: PredictionFactors) => {
  let baseScore = 50;
  const factorsApplied: string[] = [];

  // Weather factor: Rain increases by 20%
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(factors.weather)) {
    baseScore += baseScore * 0.2;
    factorsApplied.push('Rainy weather (+20%)');
  }

  // Temperature factor: Extreme temps increase by 15%
  if (factors.temperature < 5 || factors.temperature > 30) {
    baseScore += baseScore * 0.15;
    factorsApplied.push('Extreme temperature (+15%)');
  }

  // Rush hour factor: +30%
  if ((factors.hour >= 7 && factors.hour < 10) || (factors.hour >= 17 && factors.hour < 21)) {
    baseScore += baseScore * 0.3;
    factorsApplied.push('Rush hour (+30%)');
  }

  // Holiday factor: +25%
  if (factors.isHoliday) {
    baseScore += baseScore * 0.25;
    factorsApplied.push('Holiday (+25%)');
  }

  // Weekend factor: +15%
  if (factors.isWeekend) {
    baseScore += baseScore * 0.15;
    factorsApplied.push('Weekend (+15%)');
  }

  const demandScore = Math.min(100, Math.max(0, Math.round(baseScore)));

  let demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  if (demandScore < 30) demandCategory = 'Low';
  else if (demandScore < 60) demandCategory = 'Medium';
  else if (demandScore < 85) demandCategory = 'High';
  else demandCategory = 'Very High';

  const surgeMultiplier = Number((1 + (demandScore / 100) * 1.8).toFixed(1));
  const recommendedDrivers = Math.ceil(demandScore / 4.5);
  const estimatedWaitTime = demandScore < 30 ? '2-4 min' : demandScore < 60 ? '4-7 min' : demandScore < 85 ? '7-12 min' : '12-20 min';
  const revenueEstimate = demandScore < 30 ? '$150-250' : demandScore < 60 ? '$250-450' : demandScore < 85 ? '$450-750' : '$750-1200';

  return {
    demandScore,
    demandCategory,
    surgeMultiplier,
    confidenceScore: 85 + Math.random() * 10,
    recommendedDrivers,
    estimatedWaitTime,
    revenueEstimate,
    factorsApplied,
    timestamp: new Date().toISOString(),
  };
};

// --- API functions ---
export const predictDemand = async (input: PredictionInput): Promise<PredictionResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Prediction failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return generateMockPrediction(input);
  }
};

// Safely transform backend history item (snake_case to camelCase)
const transformHistoryItem = (item: any): PredictionHistoryItem => ({
  id: item?.id ?? 0,
  city: item?.city ?? '',
  temperature: item?.temperature ?? 0,
  weather: item?.weather ?? '',
  localTime: item?.local_time ?? '',
  holiday: item?.holiday ?? false,
  weekend: item?.weekend ?? false,
  demandScore: item?.demand_score ?? 0,
  demandCategory: item?.demand_category ?? 'Low',
  surgeMultiplier: item?.surge_multiplier ?? 1,
  recommendedDrivers: item?.recommended_drivers ?? 0,
  revenueEstimate: item?.revenue_estimate ?? '$0',
  explanation: item?.explanation ?? '',
  createdAt: item?.created_at ?? new Date().toISOString(),
});

export const getPredictionHistory = async (): Promise<PredictionHistoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    const data = await response.json();
    return (data ?? []).map(transformHistoryItem);
  } catch (error) {
    console.error('API Error:', error);
    return getMockHistory();
  }
};

// Export functions
export const exportToJSON = () => {
  window.open(`${API_BASE_URL}/export/json`, '_blank');
};

export const exportToCSV = () => {
  window.open(`${API_BASE_URL}/export/csv`, '_blank');
};

export const getAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    const data = await response.json();
    return transformAnalyticsData(data);
  } catch (error) {
    console.error('API Error:', error);
    return getMockAnalytics();
  }
};

export const batchPredict = async (inputs: PredictionInput[]): Promise<PredictionResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/batch-predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    });

    if (!response.ok) {
      throw new Error('Batch prediction failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return inputs.map(input => generateMockPrediction(input));
  }
};

const generateMockPrediction = (input: PredictionInput): PredictionResult => {
  const hour = parseInt(input.localTime.split(':')[0]) || 12;
  const baseScore = 50 + (hour > 6 && hour < 10 ? 30 : hour > 16 && hour < 20 ? 40 : 0) + (input.holiday ? 30 : 0);
  const demandScore = Math.round(Math.min(100, Math.max(0, baseScore + Math.random() * 20 - 10)));

  let demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  if (demandScore < 30) demandCategory = 'Low';
  else if (demandScore < 60) demandCategory = 'Medium';
  else if (demandScore < 85) demandCategory = 'High';
  else demandCategory = 'Very High';

  const surgeMultiplier = Number((1 + (demandScore / 100) * 2).toFixed(2));
  const recommendedDrivers = Math.ceil(demandScore / 4.5);

  return {
    demandScore,
    demandCategory,
    surgeMultiplier,
    recommendedDrivers,
    revenueEstimate: demandScore < 30 ? '$150-250' : demandScore < 60 ? '$250-450' : demandScore < 85 ? '$450-750' : '$750-1200',
    explanation: 'Mock prediction',
    timestamp: new Date().toISOString(),
  };
};

const getMockHistory = (): PredictionHistoryItem[] => {
  const history: PredictionHistoryItem[] = [];
  const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'];
  const weathers = ['Clear', 'Clouds', 'Rain', 'Drizzle'];

  for (let i = 0; i < 10; i++) {
    const demandScore = Math.floor(Math.random() * 100);
    let demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
    if (demandScore < 30) demandCategory = 'Low';
    else if (demandScore < 60) demandCategory = 'Medium';
    else if (demandScore < 85) demandCategory = 'High';
    else demandCategory = 'Very High';

    history.push({
      id: i + 1,
      city: cities[Math.floor(Math.random() * cities.length)],
      temperature: Math.random() * 30 - 5,
      weather: weathers[Math.floor(Math.random() * weathers.length)],
      localTime: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:00`,
      holiday: Math.random() > 0.8,
      weekend: Math.random() > 0.7,
      demandScore,
      demandCategory,
      surgeMultiplier: Number((1 + Math.random() * 2).toFixed(2)),
      recommendedDrivers: Math.ceil(demandScore / 4.5),
      revenueEstimate: demandScore < 30 ? '$150-250' : demandScore < 60 ? '$250-450' : demandScore < 85 ? '$450-750' : '$750-1200',
      explanation: 'Mock prediction',
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
  return history;
};

const getMockAnalytics = (): AnalyticsData => {
  return {
    totalPredictions: 50,
    avgDemandScore: 65.5,
    avgSurgeMultiplier: 1.65,
    highDemandCount: 20,
    hourlyDemand: [
      { hour: '00:00', demand: 35, surge: 1.2 },
      { hour: '04:00', demand: 20, surge: 1.0 },
      { hour: '08:00', demand: 85, surge: 2.1 },
      { hour: '12:00', demand: 60, surge: 1.5 },
      { hour: '16:00', demand: 75, surge: 1.8 },
      { hour: '20:00', demand: 90, surge: 2.3 },
      { hour: '23:00', demand: 45, surge: 1.3 },
    ],
    weeklyDemand: [
      { day: 'Mon', demand: 65, rides: 260 },
      { day: 'Tue', demand: 58, rides: 232 },
      { day: 'Wed', demand: 72, rides: 288 },
      { day: 'Thu', demand: 78, rides: 312 },
      { day: 'Fri', demand: 92, rides: 368 },
      { day: 'Sat', demand: 88, rides: 352 },
      { day: 'Sun', demand: 60, rides: 240 },
    ],
    weatherImpact: [
      { weather: 'Clear', avgDemand: 50, impact: 'Low' },
      { weather: 'Clouds', avgDemand: 60, impact: 'Medium' },
      { weather: 'Rain', avgDemand: 80, impact: 'High' },
      { weather: 'Drizzle', avgDemand: 75, impact: 'High' },
    ]
  };
};

// Safely transform backend data (which has snake_case) to our interface's camelCase
const transformAnalyticsData = (data: any): AnalyticsData => {
  return {
    totalPredictions: data?.total_predictions ?? 0,
    avgDemandScore: data?.avg_demand_score ?? 0,
    avgSurgeMultiplier: data?.avg_surge_multiplier ?? 1,
    highDemandCount: data?.high_demand_count ?? 0,
    hourlyDemand: (data?.hourly_demand ?? []).map((item: any) => ({
      hour: item?.hour ?? '00:00',
      demand: item?.demand ?? 0,
      surge: item?.surge ?? 1,
    })),
    weeklyDemand: (data?.weekly_demand ?? []).map((item: any) => ({
      day: item?.day ?? 'Mon',
      demand: item?.demand ?? 0,
      rides: item?.rides ?? 0,
    })),
    weatherImpact: (data?.weather_impact ?? []).map((item: any) => ({
      weather: item?.weather ?? 'Clear',
      avgDemand: item?.avg_demand ?? 0,
      impact: item?.impact ?? 'Low',
    })),
  };
};
