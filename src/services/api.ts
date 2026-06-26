import { PredictionInput, PredictionResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export const getPredictionHistory = async (): Promise<PredictionResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return getMockHistory();
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
  const baseScore = 50 + (input.hour > 6 && input.hour < 10 ? 30 : input.hour > 16 && input.hour < 20 ? 40 : 0) + (input.eventFlag ? 30 : 0);
  const demandScore = Math.round(Math.min(100, Math.max(0, baseScore + Math.random() * 20 - 10)));
  
  let demandCategory: 'Low' | 'Medium' | 'High' | 'Very High';
  if (demandScore < 30) demandCategory = 'Low';
  else if (demandScore < 60) demandCategory = 'Medium';
  else if (demandScore < 85) demandCategory = 'High';
  else demandCategory = 'Very High';

  const surgeMultiplier = Number((1 + (demandScore / 100) * 2).toFixed(2));

  return {
    demandScore,
    demandCategory,
    surgeMultiplier,
    timestamp: new Date().toISOString(),
  };
};

const getMockHistory = (): PredictionResult[] => {
  const history: PredictionResult[] = [];
  for (let i = 0; i < 10; i++) {
    history.push({
      demandScore: Math.floor(Math.random() * 100),
      demandCategory: ['Low', 'Medium', 'High', 'Very High'][Math.floor(Math.random() * 4)] as any,
      surgeMultiplier: Number((1 + Math.random() * 2).toFixed(2)),
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
  return history;
};
