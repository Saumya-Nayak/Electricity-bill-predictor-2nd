import React, { useState } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';

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

interface DataCollectionProps {
  data: DataEntry[];
  onDataChange: (data: DataEntry[]) => void;
}

export default function DataCollection({ data, onDataChange }: DataCollectionProps) {
  const [formData, setFormData] = useState({
    date: '',
    unitsConsumed: '',
    householdSize: '',
    appliances: '',
    electricityRate: '',
    weather: 'Moderate',
    region: 'Urban',
    billAmount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.unitsConsumed || !formData.billAmount) return;

    const newEntry: DataEntry = {
      id: Date.now().toString(),
      date: formData.date,
      unitsConsumed: parseFloat(formData.unitsConsumed),
      householdSize: parseInt(formData.householdSize) || 1,
      appliances: formData.appliances,
      electricityRate: parseFloat(formData.electricityRate) || 5.0,
      weather: formData.weather,
      region: formData.region,
      billAmount: parseFloat(formData.billAmount)
    };

    onDataChange([...data, newEntry]);
    setFormData({
      date: '',
      unitsConsumed: '',
      householdSize: '',
      appliances: '',
      electricityRate: '',
      weather: 'Moderate',
      region: 'Urban',
      billAmount: ''
    });
  };

  const generateSampleData = () => {
    const sampleData: DataEntry[] = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const baseUnits = 8 + Math.random() * 4; // 8-12 units per day
      const seasonMultiplier = Math.random() > 0.5 ? 1.2 : 0.9;
      const unitsConsumed = Math.round(baseUnits * seasonMultiplier * 100) / 100;
      
      sampleData.push({
        id: `sample-${i}`,
        date: date.toISOString().split('T')[0],
        unitsConsumed: unitsConsumed,
        householdSize: Math.floor(Math.random() * 4) + 2,
        appliances: `${Math.floor(Math.random() * 8) + 5} appliances`,
        electricityRate: 4.5 + Math.random() * 2,
        weather: ['Hot', 'Cold', 'Moderate'][Math.floor(Math.random() * 3)],
        region: Math.random() > 0.6 ? 'Rural' : 'Urban',
        billAmount: Math.round(unitsConsumed * (4.5 + Math.random() * 2) * 100) / 100
      });
    }
    
    onDataChange([...data, ...sampleData]);
  };

  const deleteEntry = (id: string) => {
    onDataChange(data.filter(entry => entry.id !== id));
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Units_Consumed', 'Household_Size', 'Appliances', 'Electricity_Rate', 'Weather', 'Region', 'Bill_Amount'],
      ...data.map(entry => [
        entry.date,
        entry.unitsConsumed,
        entry.householdSize,
        entry.appliances,
        entry.electricityRate,
        entry.weather,
        entry.region,
        entry.billAmount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'electricity-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus className="h-6 w-6 text-blue-600" />
          Data Collection
        </h2>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Units Consumed</label>
            <input
              type="number"
              step="0.01"
              value={formData.unitsConsumed}
              onChange={(e) => setFormData({...formData, unitsConsumed: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 10.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Household Size</label>
            <input
              type="number"
              value={formData.householdSize}
              onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Appliances</label>
            <input
              type="text"
              value={formData.appliances}
              onChange={(e) => setFormData({...formData, appliances: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 8 appliances"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Electricity Rate (₹/unit)</label>
            <input
              type="number"
              step="0.01"
              value={formData.electricityRate}
              onChange={(e) => setFormData({...formData, electricityRate: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weather</label>
            <select
              value={formData.weather}
              onChange={(e) => setFormData({...formData, weather: e.target.value})}
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
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Urban">Urban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.billAmount}
              onChange={(e) => setFormData({...formData, billAmount: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1250.00"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </div>
        </form>

        <div className="mt-6 flex gap-4">
          <button
            onClick={generateSampleData}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Generate Sample Data
          </button>
          
          {data.length > 0 && (
            <button
              onClick={exportData}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Collected Data ({data.length} entries)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Units</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Household</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Weather</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Region</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Bill (₹)</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slice(-10).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{entry.date}</td>
                    <td className="px-4 py-2">{entry.unitsConsumed}</td>
                    <td className="px-4 py-2">{entry.householdSize}</td>
                    <td className="px-4 py-2">{entry.weather}</td>
                    <td className="px-4 py-2">{entry.region}</td>
                    <td className="px-4 py-2">₹{entry.billAmount}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}