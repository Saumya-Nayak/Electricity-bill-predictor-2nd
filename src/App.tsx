import React, { useState } from 'react';
import { Zap, BarChart3, Settings, Download, TrendingUp } from 'lucide-react';
import DataCollection from './components/DataCollection';
import ModelTraining from './components/ModelTraining';
import Predictions from './components/Predictions';
import Analytics from './components/Analytics';

interface DataEntry {
  id: string;
  date: string;
  unitsConsumed: number;
  householdSize: number;
  appliances: string;
  electricityRate: number;
  weather: string;
  region: string;
  billAmount: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('data');
  const [data, setData] = useState<DataEntry[]>([]);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);

  const tabs = [
    { id: 'data', label: 'Data Collection', icon: Settings },
    { id: 'training', label: 'Model Training', icon: BarChart3 },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: Zap }
  ];

  const handleDataChange = (newData: DataEntry[]) => {
    setData(newData);
  };

  const handleModelTrained = (model: any) => {
    setTrainedModel(model);
  };

  const handlePredictions = (newPredictions: any[]) => {
    setPredictions(newPredictions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ElectricityAI</h1>
                <p className="text-sm text-gray-600">Smart Bill Prediction System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{data.length}</span> data points
              </div>
              {trainedModel && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Model Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{data.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trainedModel ? 'Trained' : 'Not Trained'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictions</p>
                <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trainedModel ? `${trainedModel.accuracy}%` : 'N/A'}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'data' && (
            <DataCollection data={data} onDataChange={handleDataChange} />
          )}
          {activeTab === 'training' && (
            <ModelTraining dataCount={data.length} onModelTrained={handleModelTrained} />
          )}
          {activeTab === 'predictions' && (
            <Predictions
              data={data}
              trainedModel={trainedModel}
              onPredictions={handlePredictions}
            />
          )}
          {activeTab === 'analytics' && (
            <Analytics data={data} predictions={predictions} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;