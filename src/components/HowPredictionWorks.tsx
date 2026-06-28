import React from 'react';

interface HowPredictionWorksProps {
  compact?: boolean;
}

const HowPredictionWorks: React.FC<HowPredictionWorksProps> = ({ compact = false }) => {
  return (
    <div className={`bg-dark-card border border-dark-border rounded-2xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            How Prediction Works
          </h3>
          <p className="text-gray-400 mt-1 text-sm">
            Understanding our AI-powered demand forecast
          </p>
        </div>
        {!compact && (
          <div className="px-3 py-1 bg-primary-blue/10 border border-primary-blue/30 rounded-full text-primary-blue text-xs font-semibold">
            MOCK LOGIC • REPLACE WITH FASTAPI
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Formula */}
        <div className="bg-dark-bg rounded-xl p-4 border border-dark-border">
          <h4 className="text-white font-semibold mb-3 text-sm">
            Demand Score Formula
          </h4>
          <div className="text-center font-mono bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-lg p-4 border border-primary-blue/20">
            <div className="text-sm text-gray-300">
              Demand Score =
            </div>
            <div className="text-lg text-primary-blue font-bold mt-2">
              (hour weight + weather weight + event weight + holiday weight + zone demand weight)
            </div>
          </div>
        </div>

        {/* Calculations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-blue rounded-full" />
              Input Weights
            </h5>
            <ul className="text-gray-400 text-sm space-y-1 list-disc pl-4">
              <li><span className="text-primary-blue font-medium">Hour:</span> Rush hours (+25–40), off-peak (+5–15)</li>
              <li><span className="text-primary-purple font-medium">Weather:</span> Rain/Snow (+20), Sunny (+5)</li>
              <li><span className="text-orange-400 font-medium">Event:</span> Yes (+30), No (+0)</li>
              <li><span className="text-purple-400 font-medium">Holiday:</span> Yes (+15), No (+0)</li>
              <li><span className="text-green-400 font-medium">Zone:</span> Downtown (+25), Airport (+20), etc.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-purple rounded-full" />
              Output Calculations
            </h5>
            <ul className="text-gray-400 text-sm space-y-1 list-disc pl-4">
              <li><span className="text-orange-400 font-medium">Demand Category:</span> From score range (0–30 Low, 30–60 Medium, 60–85 High, 85+ Very High)</li>
              <li><span className="text-orange-400 font-medium">Surge Multiplier:</span> 1.0 + (score / 100) × 1.8</li>
              <li><span className="text-primary-blue font-medium">Recommended Drivers:</span> Ceiling(score / 4.5)</li>
              <li><span className="text-green-400 font-medium">Revenue Estimate:</span> Based on expected rides and surge</li>
            </ul>
          </div>
        </div>

        {/* Note about FastAPI */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-yellow-400 font-semibold text-sm mb-1">
                Mock Prediction Logic
              </h4>
              <p className="text-gray-400 text-xs">
                This is a placeholder implementation for demonstration. 
                In production, these calculations will be replaced with a 
                FastAPI backend running real machine learning models trained 
                on historical ride data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowPredictionWorks;
