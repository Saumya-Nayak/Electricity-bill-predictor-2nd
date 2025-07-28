import React from 'react';
import { BarChart, TrendingUp, AlertTriangle, Zap, Target, Calendar } from 'lucide-react';

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

interface AnalyticsProps {
  data: DataEntry[];
  predictions: any[];
}

export default function Analytics({ data, predictions }: AnalyticsProps) {
  const calculateStats = () => {
    if (data.length === 0) return null;

    const totalUnits = data.reduce((sum, d) => sum + d.unitsConsumed, 0);
    const totalBill = data.reduce((sum, d) => sum + d.billAmount, 0);
    const avgDaily = totalUnits / data.length;
    const avgBill = totalBill / data.length;
    const avgRate = data.reduce((sum, d) => sum + d.electricityRate, 0) / data.length;

    // Calculate trends
    const recent = data.slice(-7);
    const older = data.slice(0, -7);
    const recentAvg = recent.reduce((sum, d) => sum + d.unitsConsumed, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, d) => sum + d.unitsConsumed, 0) / older.length : recentAvg;
    const trend = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      totalUnits: Math.round(totalUnits * 100) / 100,
      totalBill: Math.round(totalBill * 100) / 100,
      avgDaily: Math.round(avgDaily * 100) / 100,
      avgBill: Math.round(avgBill * 100) / 100,
      avgRate: Math.round(avgRate * 100) / 100,
      trend: Math.round(trend * 100) / 100,
      days: data.length
    };
  };

  const getPredictionStats = () => {
    if (predictions.length === 0) return null;

    const avgPredicted = predictions.reduce((sum, p) => sum + p.predictedAmount, 0) / predictions.length;
    const maxPredicted = Math.max(...predictions.map(p => p.predictedAmount));
    const minPredicted = Math.min(...predictions.map(p => p.predictedAmount));
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    return {
      avgPredicted: Math.round(avgPredicted * 100) / 100,
      maxPredicted: Math.round(maxPredicted * 100) / 100,
      minPredicted: Math.round(minPredicted * 100) / 100,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      count: predictions.length
    };
  };

  const getConsumptionInsights = () => {
    if (data.length === 0) return [];

    const insights = [];
    const stats = calculateStats();
    
    if (stats) {
      if (stats.trend > 15) {
        insights.push({
          type: 'warning',
          title: 'High Consumption Trend',
          message: `Your electricity usage has increased by ${stats.trend.toFixed(1)}% recently. Consider energy-saving measures.`
        });
      } else if (stats.trend < -15) {
        insights.push({
          type: 'success',
          title: 'Great Energy Saving',
          message: `Your electricity usage has decreased by ${Math.abs(stats.trend).toFixed(1)}% recently. Keep it up!`
        });
      }

      if (stats.avgRate > 6) {
        insights.push({
          type: 'warning',
          title: 'High Electricity Rate',
          message: `Your average rate of ₹${stats.avgRate}/unit is higher than average. Consider switching to a different tariff.`
        });
      }

      // Weather-based insights
      const hotWeatherData = data.filter(d => d.weather === 'Hot');
      const coldWeatherData = data.filter(d => d.weather === 'Cold');
      const moderateWeatherData = data.filter(d => d.weather === 'Moderate');

      if (hotWeatherData.length > 0) {
        const hotAvg = hotWeatherData.reduce((sum, d) => sum + d.unitsConsumed, 0) / hotWeatherData.length;
        const moderateAvg = moderateWeatherData.length > 0 ? moderateWeatherData.reduce((sum, d) => sum + d.unitsConsumed, 0) / moderateWeatherData.length : hotAvg;
        
        if (hotAvg > moderateAvg * 1.2) {
          insights.push({
            type: 'info',
            title: 'Weather Impact',
            message: `Hot weather increases your consumption by ${(((hotAvg - moderateAvg) / moderateAvg) * 100).toFixed(1)}%. Consider energy-efficient cooling.`
          });
        }
      }
    }

    return insights;
  };

  const getWeatherDistribution = () => {
    if (data.length === 0) return [];

    const weatherStats = data.reduce((acc, d) => {
      acc[d.weather] = (acc[d.weather] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(weatherStats).map(([weather, count]) => ({
      weather,
      count,
      percentage: Math.round((count / data.length) * 100)
    }));
  };

  const stats = calculateStats();
  const predictionStats = getPredictionStats();
  const insights = getConsumptionInsights();
  const weatherDistribution = getWeatherDistribution();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Units</p>
              <p className="text-2xl font-bold">{stats?.totalUnits || 0}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Bill</p>
              <p className="text-2xl font-bold">₹{stats?.totalBill || 0}</p>
            </div>
            <Target className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Daily Average</p>
              <p className="text-2xl font-bold">{stats?.avgDaily || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Usage Trend</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {stats?.trend || 0}%
                <TrendingUp className={`h-4 w-4 ${(stats?.trend || 0) >= 0 ? 'text-amber-200' : 'text-amber-200 rotate-180'}`} />
              </p>
            </div>
            <BarChart className="h-8 w-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Insights & Recommendations
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-400' :
                  insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Consumption Analysis</h3>
          {stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Daily Usage:</span>
                <span className="font-medium">{stats.avgDaily} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Bill:</span>
                <span className="font-medium">₹{stats.avgBill}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Rate:</span>
                <span className="font-medium">₹{stats.avgRate}/unit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Data Points:</span>
                <span className="font-medium">{stats.days} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Usage Trend:</span>
                <span className={`font-medium ${stats.trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.trend >= 0 ? '+' : ''}{stats.trend}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No consumption data available</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Prediction Analysis</h3>
          {predictionStats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Predicted Bill:</span>
                <span className="font-medium">₹{predictionStats.avgPredicted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Prediction:</span>
                <span className="font-medium">₹{predictionStats.maxPredicted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lowest Prediction:</span>
                <span className="font-medium">₹{predictionStats.minPredicted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Confidence:</span>
                <span className="font-medium">{predictionStats.avgConfidence}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Predictions:</span>
                <span className="font-medium">{predictionStats.count}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No prediction data available</p>
          )}
        </div>
      </div>

      {/* Weather Distribution */}
      {weatherDistribution.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weather Distribution</h3>
          <div className="space-y-3">
            {weatherDistribution.map((item) => (
              <div key={item.weather} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    item.weather === 'Hot' ? 'bg-red-500' :
                    item.weather === 'Cold' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-gray-700">{item.weather}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.weather === 'Hot' ? 'bg-red-500' :
                        item.weather === 'Cold' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau Integration Guide */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tableau Integration Guide</h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Recommended Visualizations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Line chart: Daily usage trends over time</li>
              <li>• Bar chart: Predicted vs actual bills comparison</li>
              <li>• Gauge chart: Consumption warning levels</li>
              <li>• Heat map: Usage patterns by weather/season</li>
              <li>• Scatter plot: Units consumed vs bill amount</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Data Export Format</h4>
            <p className="text-sm text-gray-600">
              CSV files are exported with proper column headers and data types optimized for Tableau:
              Date (Date), Units_Consumed (Number), Predicted_Amount (Number), Confidence (Number)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}