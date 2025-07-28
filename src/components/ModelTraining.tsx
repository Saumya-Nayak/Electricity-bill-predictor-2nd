import React, { useState } from 'react';
import { Brain, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface ModelTrainingProps {
  dataCount: number;
  onModelTrained: (model: any) => void;
}

export default function ModelTraining({ dataCount, onModelTrained }: ModelTrainingProps) {
  const [selectedModel, setSelectedModel] = useState('linear');
  const [isTraining, setIsTraining] = useState(false);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const models = [
    {
      id: 'linear',
      name: 'Linear Regression',
      description: 'Simple linear relationship between features and bill amount',
      accuracy: 85,
      speed: 'Fast',
      complexity: 'Low'
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree',
      description: 'Tree-based model that handles non-linear relationships',
      accuracy: 78,
      speed: 'Medium',
      complexity: 'Medium'
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      description: 'Ensemble of decision trees for better accuracy',
      accuracy: 92,
      speed: 'Slow',
      complexity: 'High'
    },
    {
      id: 'automl',
      name: 'AutoML',
      description: 'Automatically selects the best model for your data',
      accuracy: 89,
      speed: 'Variable',
      complexity: 'Automatic'
    }
  ];

  const trainModel = async () => {
    if (dataCount < 10) {
      alert('Please collect at least 10 data points before training');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training process
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          
          const model = {
            type: selectedModel,
            accuracy: models.find(m => m.id === selectedModel)?.accuracy || 85,
            trainedAt: new Date().toISOString(),
            features: ['units_consumed', 'household_size', 'weather', 'region', 'electricity_rate'],
            coefficients: generateCoefficients(selectedModel)
          };
          
          setTrainedModel(model);
          onModelTrained(model);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const generateCoefficients = (modelType: string) => {
    switch (modelType) {
      case 'linear':
        return {
          units_consumed: 4.5,
          household_size: 50,
          weather_hot: 0.8,
          weather_cold: 0.6,
          region_urban: 0.2,
          electricity_rate: 1.0,
          intercept: 100
        };
      case 'decision_tree':
        return {
          feature_importance: {
            units_consumed: 0.45,
            electricity_rate: 0.25,
            household_size: 0.15,
            weather: 0.10,
            region: 0.05
          }
        };
      case 'random_forest':
        return {
          n_estimators: 100,
          feature_importance: {
            units_consumed: 0.42,
            electricity_rate: 0.28,
            household_size: 0.18,
            weather: 0.08,
            region: 0.04
          }
        };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Model Training
        </h2>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="text-sm text-gray-600">
              Data Points Available: <strong>{dataCount}</strong>
              {dataCount < 10 && ' (Minimum 10 required)'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {models.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedModel === model.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{model.name}</h3>
                <span className="text-sm text-purple-600 font-medium">{model.accuracy}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{model.description}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Speed: {model.speed}</span>
                <span>Complexity: {model.complexity}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={trainModel}
          disabled={isTraining || dataCount < 10}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isTraining || dataCount < 10
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isTraining ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Training... {trainingProgress}%
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Train Model
            </>
          )}
        </button>

        {isTraining && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {trainedModel && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Model Training Complete
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Model Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Model Type:</span>
                  <span className="font-medium">{models.find(m => m.id === trainedModel.type)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium text-green-600">{trainedModel.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trained At:</span>
                  <span className="font-medium">{new Date(trainedModel.trainedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Feature Importance</h4>
              <div className="space-y-2">
                {trainedModel.type === 'linear' ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Units Consumed:</span>
                      <span className="font-medium">₹{trainedModel.coefficients.units_consumed}/unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Household Size:</span>
                      <span className="font-medium">₹{trainedModel.coefficients.household_size}/person</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {Object.entries(trainedModel.coefficients.feature_importance || {}).map(([feature, importance]) => (
                      <div key={feature} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{feature.replace('_', ' ')}:</span>
                        <span className="font-medium">{((importance as number) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}