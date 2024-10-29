import React, { useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  enabled: boolean;
  threshold?: number;
}

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', name: 'Below 30 Gwei', enabled: true, threshold: 30 },
    { id: '2', name: 'Daily Summary', enabled: true },
    { id: '3', name: 'Price Spikes', enabled: false, threshold: 150 }
  ]);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">Custom Alerts</h2>
          <span className="bg-blue-500/10 text-blue-500 text-xs px-2 py-1 rounded-full">
            2 Active
          </span>
        </div>
        <Bell className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`w-4 h-4 ${alert.enabled ? 'text-yellow-500' : 'text-slate-500'}`} />
              <div>
                <span className="text-sm font-medium">{alert.name}</span>
                {alert.threshold && (
                  <p className="text-xs text-slate-400">Threshold: {alert.threshold} Gwei</p>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={alert.enabled}
                onChange={() => toggleAlert(alert.id)}
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors text-sm font-medium">
        Add New Alert
      </button>
    </div>
  );
};

export default AlertsPanel;