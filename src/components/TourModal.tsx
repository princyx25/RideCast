
import React, { useState } from 'react';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TourSteps = [
  {
    step: 1,
    title: "Predict Demand",
    description: "Enter a city name and click Predict to generate ride demand insights."
  },
  {
    step: 2,
    title: "Live Data Collection",
    description: "The app fetches weather, time, holiday and weekend information."
  },
  {
    step: 3,
    title: "AI Prediction Engine",
    description: "FastAPI backend processes the request and calculates demand score, surge multiplier and recommended drivers."
  },
  {
    step: 4,
    title: "Dashboard",
    description: "View real-time statistics and overall demand trends."
  },
  {
    step: 5,
    title: "Batch Prediction",
    description: "Predict ride demand for multiple cities simultaneously."
  },
  {
    step: 6,
    title: "Analytics",
    description: "Analyze trends, peak demand hours and demand patterns."
  },
  {
    step: 7,
    title: "History",
    description: "View all previous predictions stored in backend database."
  },
  {
    step: 8,
    title: "Knowledge and Settings",
    description: "Access user guide, restart tutorial and customize application settings."
  },
];

const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const totalSteps = TourSteps.length;
  const stepData = TourSteps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('ridecast_tour_completed', 'true');
    onClose();
    setCurrentStep(1);
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">How to Use RideCast</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <p className="text-primary-blue font-medium mb-2">
          Step {currentStep} of {totalSteps}
        </p>
        <div className="w-full bg-dark-bg rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-primary-blue to-primary-purple h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3">
            {stepData.title}
          </h3>
          <p className="text-gray-400">
            {stepData.description}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Skip
          </button>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="bg-dark-bg border border-dark-border text-white px-5 py-2 rounded-lg hover:bg-dark-border transition-all"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary-blue to-primary-purple text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              {currentStep === totalSteps ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourModal;
