import React, { useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface Alert {
  id: string;
  name: string;
  enabled: boolean;
  threshold?: number;
}

const AlertsPanel: React.FC = () => {
  const { isDark } = useTheme();
  
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
    <div className={`${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'
    } rounded-xl p-4 border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Custom Alerts
          </h3>
          <span className={`${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
          } text-xs px-2 py-0.5 rounded-full`}>
            {alerts.filter(a => a.enabled).length} Active
          </span>
        </div>
        <Bell className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className={`flex items-center justify-between p-3 ${
            isDark ? 'bg-slate-700/50' : 'bg-white'
          } rounded-lg`}>
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`w-4 h-4 ${
                alert.enabled 
                  ? isDark ? 'text-blue-400' : 'text-blue-500'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <div>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>{alert.name}</span>
                {alert.threshold && (
                  <p className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>Threshold: {alert.threshold} Gwei</p>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" aria-label={`Toggle ${alert.name} alert`}>
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={alert.enabled}
                onChange={() => toggleAlert(alert.id)}
              />
              <div className={`w-11 h-6 ${
                isDark ? 'bg-slate-600' : 'bg-slate-200'
              } peer-checked:bg-blue-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`} />
            </label>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium">
        Add New Alert
      </button>
    </div>
  );
};

export default AlertsPanel;