import React from 'react';
import { Bell } from 'lucide-react';

const AlertsPanel: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Custom Alerts</h2>
        <Bell className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <span>Below 30 Gwei</span>
          <label className="relative inline-flex items-center cursor-pointer" htmlFor="below30Gwei">
            <input 
              id="below30Gwei"
              type="checkbox" 
              className="sr-only peer" 
              checked 
              aria-label="Toggle alert for below 30 Gwei"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <span>Daily Summary</span>
          <label className="relative inline-flex items-center cursor-pointer" htmlFor="dailySummary">
            <input 
              id="dailySummary"
              type="checkbox" 
              className="sr-only peer" 
              checked 
              aria-label="Toggle daily summary alerts"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <span>Price Spikes</span>
          <label className="relative inline-flex items-center cursor-pointer" htmlFor="priceSpikes">
            <input 
              id="priceSpikes"
              type="checkbox" 
              className="sr-only peer"
              aria-label="Toggle price spike alerts"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;