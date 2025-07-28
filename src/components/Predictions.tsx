import React, { useState } from 'react';
import { Calculator, Download, AlertTriangle, TrendingUp, Calendar, Zap } from 'lucide-react';

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

interface PredictionsProps {
  data: DataEntry[];
  trainedModel: any;
  onPredictions: (predictions: any[]) => void;
}

interface PredictionInput {
  unitsConsumed: string;
  householdSize: string;
  appliances: string;
  electricityRate: string;
  weather: string;
  region: string;
  predictionDate: string;
}

export default function Predictions({ data, trainedModel, onPredictions }: PredictionsProps) {
  const [predictionInput, setPredictionInput] = useState<PredictionInput>({
    unitsConsumed: '',
    householdSize: '4',
    appliances: '8',
    electricityRate: '5.5',
    weather: 'Moderate',
    region: 'Urban',
    predictionDate: new Date().toISOString().split('T')[0]
  });

  const [predictions, setPredictions] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  const makePrediction = async () => {
    if (!trainedModel) {
      alert('Please train a model first');
      return;
    }

    if (!predictionInput.unitsConsumed) {
      alert('Please enter units consumed');
      return;
    }

    setIsCalculating(true);

    // Simulate prediction calculation
    setTimeout(() => {
      const prediction = calculatePrediction(predictionInput);
      const newPredictions = [...predictions, prediction];
      setPredictions(newPredictions);
      onPredictions(newPredictions);
      setIsCalculating(false);
      
      // Reset form
      setPredictionInput({
        ...predictionInput,
        unitsConsumed: '',
        predictionDate: new Date().toISOString().split('T')[0]
      });
    }, 1500);
  };

  const calculatePrediction = (input: PredictionInput) => {
    const units = parseFloat(input.unitsConsumed);
    const household = parseInt(input.householdSize);
    const rate = parseFloat(input.electricityRate);
    
    let basePrediction = 0;
    
    if (trainedModel.type === 'linear') {
      basePrediction = 
        (units * trainedModel.coefficients.units_consumed) +
        (household * trainedModel.coefficients.household_size) +
        (rate * trainedModel.coefficients.electricity_rate) +
        trainedModel.coefficients.intercept;
        
      // Apply weather and region adjustments
      if (input.weather === 'Hot') basePrediction *= 1.2;
      else if (input.weather === 'Cold') basePrediction *= 1.1;
      
      if (input.region === 'Urban') basePrediction *= 1.05;
    } else {
      // For other models, use a simplified calculation
      basePrediction = units * rate * 1.15; // Basic calculation with overhead
      
      // Apply adjustments based on other factors
      basePrediction += household * 25; // Per person overhead
      if (input.weather === 'Hot') basePrediction *= 1.25;
      else if (input.weather === 'Cold') basePrediction *= 1.15;
    }

    const confidence = Math.max(0.75, Math.min(0.95, trainedModel.accuracy / 100));
    const margin = basePrediction * (1 - confidence) * 0.5;
    
    return {
      id: Date.now().toString(),
      date: input.predictionDate,
      unitsConsumed: units,
      householdSize: household,
      appliances: input.appliances,
      electricityRate: rate,
      weather: input.weather,
      region: input.region,
      predictedAmount: Math.round(basePrediction * 100) / 100,
      confidence: Math.round(confidence * 100),
      range: {
        min: Math.round((basePrediction - margin) * 100) / 100,
        max: Math.round((basePrediction + margin) * 100) / 100
      },
      modelType: trainedModel.type,
      createdAt: new Date().toISOString()
    };
  };

  const generateBulkPredictions = () => {
    if (!trainedModel) {
      alert('Please train a model first');
      return;
    }

    setIsCalculating(true);

    // Generate predictions for next 12 months
    const bulkPredictions = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      // Use average values from existing data
      const avgUnits = data.length > 0 ? data.reduce((sum, d) => sum + d.unitsConsumed, 0) / data.length : 10;
      const avgHousehold = data.length > 0 ? data.reduce((sum, d) => sum + d.householdSize, 0) / data.length : 4;
      const avgRate = data.length > 0 ? data.reduce((sum, d) => sum + d.electricityRate, 0) / data.length : 5.5;
      
      // Add seasonal variation
      const month = futureDate.getMonth();
      let seasonalUnits = avgUnits;
      let weather = 'Moderate';
      
      if (month >= 3 && month <= 5) { // Summer
        seasonalUnits *= 1.3;
        weather = 'Hot';
      } else if (month >= 10 || month <= 1) { // Winter
        seasonalUnits *= 1.2;
        weather = 'Cold';
      }
      
      const prediction = calculatePrediction({
        unitsConsumed: seasonalUnits.toFixed(1),
        householdSize: Math.round(avgHousehold).toString(),
        appliances: '8',
        electricityRate: avgRate.toFixed(2),
        weather,
        region: 'Urban',
        predictionDate: futureDate.toISOString().split('T')[0]
      });
      
      bulkPredictions.push(prediction);
    }
    
    setTimeout(() => {
      const allPredictions = [...predictions, ...bulkPredictions];
      setPredictions(allPredictions);
      onPredictions(allPredictions);
      setIsCalculating(false);
    }, 2000);
  };

  const exportPredictions = () => {
    if (predictions.length === 0) {
      alert('No predictions to export');
      return;
    }

    const csvContent = [
      ['Date', 'Units_Consumed', 'Household_Size', 'Appliances', 'Electricity_Rate', 'Weather', 'Region', 'Predicted_Amount', 'Confidence', 'Min_Range', 'Max_Range', 'Model_Type'],
      ...predictions.map(pred => [
        pred.date,
        pred.unitsConsumed,
        pred.householdSize,
        pred.appliances,
        pred.electricityRate,
        pred.weather,
        pred.region,
        pred.predictedAmount,
        pred.confidence,
        pred.range.min,
        pred.range.max,
        pred.modelType
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electricity-predictions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWarningLevel = (prediction: any) => {
    if (data.length === 0) return 'normal';
    
    const avgBill = data.reduce((sum, d) => sum + d.billAmount, 0) / data.length;
    const increase = ((prediction.predictedAmount - avgBill) / avgBill) * 100;
    
    if (increase > 30) return 'high';
    if (increase > 15) return 'medium';
    return 'normal';
  };

  if (!trainedModel) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Model Available</h2>
        <p className="text-gray-600">Please train a model first before making predictions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prediction Mode Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Bill Predictions
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                bulkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bulkMode ? 'Single Mode' : 'Bulk Mode'}
            </button>
            {predictions.length > 0 && (
              <button
                onClick={exportPredictions}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {!bulkMode ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Date</label>
              <input
                type="date"
                value={predictionInput.predictionDate}
                onChange={(e) => setPredictionInput({...predictionInput, predictionDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Units Consumed</label>
              <input
                type="number"
                step="0.01"
                value={predictionInput.unitsConsumed}
                onChange={(e) => setPredictionInput({...predictionInput, unitsConsumed: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Household Size</label>
              <input
                type="number"
                value={predictionInput.householdSize}
                onChange={(e) => setPredictionInput({...predictionInput, householdSize: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appliances</label>
              <input
                type="text"
                value={predictionInput.appliances}
                onChange={(e) => setPredictionInput({...predictionInput, appliances: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 8 appliances"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Electricity Rate (₹/unit)</label>
              <input
                type="number"
                step="0.01"
                value={predictionInput.electricityRate}
                onChange={(e) => setPredictionInput({...predictionInput, electricityRate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weather</label>
              <select
                value={predictionInput.weather}
                onChange={(e) => setPredictionInput({...predictionInput, weather: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Hot">Hot</option>
                <option value="Cold">Cold</option>
                <option value="Moderate">Moderate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={predictionInput.region}
                onChange={(e) => setPredictionInput({...predictionInput, region: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <button
                onClick={makePrediction}
                disabled={isCalculating}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isCalculating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Predict Bill
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">12-Month Bulk Predictions</h3>
            <p className="text-gray-600 mb-6">Generate predictions for the next 12 months based on your historical data</p>
            <button
              onClick={generateBulkPredictions}
              disabled={isCalculating}
              className={`py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto ${
                isCalculating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Generate Predictions
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Predictions Results */}
      {predictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Prediction Results ({predictions.length} predictions)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Units</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Predicted Bill</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Confidence</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Range</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.slice(-10).map((prediction) => {
                  const warningLevel = getWarningLevel(prediction);
                  return (
                    <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{prediction.date}</td>
                      <td className="px-4 py-3">{prediction.unitsConsumed}</td>
                      <td className="px-4 py-3 font-medium">₹{prediction.predictedAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prediction.confidence > 85 ? 'bg-green-100 text-green-800' :
                          prediction.confidence > 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prediction.confidence}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        ₹{prediction.range.min} - ₹{prediction.range.max}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          warningLevel === 'high' ? 'bg-red-100 text-red-800' :
                          warningLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {warningLevel === 'high' ? 'High' : 
                           warningLevel === 'medium' ? 'Medium' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}