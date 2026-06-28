
import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import TourModal from '../components/TourModal';

const knowledgeItems = [
  {
    number: 1,
    title: "Predict Demand",
    icon: "📈",
    description: "Enter city and click Predict to get demand score, surge multiplier, drivers needed, and revenue estimate."
  },
  {
    number: 2,
    title: "Dashboard",
    icon: "📊",
    description: "View total predictions, active drivers, average demand score, surge multiplier, and high-demand cases."
  },
  {
    number: 3,
    title: "Batch Prediction",
    icon: "📋",
    description: "Upload or enter multiple city records to predict demand for many locations together."
  },
  {
    number: 4,
    title: "Analytics",
    icon: "📉",
    description: "Analyze demand trends, high-demand zones, surge patterns, and prediction performance."
  },
  {
    number: 5,
    title: "History",
    icon: "⏰",
    description: "View all previous predictions stored from the backend."
  },
  {
    number: 6,
    title: "Export",
    icon: "📥",
    description: "Download prediction history as CSV, JSON, or PDF report."
  },
  {
    number: 7,
    title: "Settings",
    icon: "⚙️",
    description: "Change theme, appearance, profile, and app preferences."
  },
];

const Knowledge: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { addNotification } = useNotification();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Knowledge</h1>
          <p className="text-gray-400 mt-2">How to use RideCast, step-by-step</p>
        </div>
        <button
          onClick={() => setIsTourOpen(true)}
          className="bg-gradient-to-r from-primary-blue to-primary-purple text-white px-5 py-2 rounded-lg hover:opacity-90 transition-all"
        >
          Restart Tutorial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {knowledgeItems.map((item) => (
          <div
            key={item.number}
            className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary-blue/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-primary-purple rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-primary-blue font-bold text-sm">
                    Step {item.number}
                  </span>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>
                <p className="text-gray-400">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};

export default Knowledge;
