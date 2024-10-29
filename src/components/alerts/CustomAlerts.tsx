import React, { useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { useTheme } from '../../hooks/useTheme';

export const CustomAlerts: React.FC = () => {
  const { isDark } = useTheme();
  const { alerts, createAlert, deleteAlert, toggleAlert } = useAlerts();
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    threshold: 30,
    type: 'below' as const
  });

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAlert({
      ...newAlert,
      enabled: true
    });
    setIsAddingAlert(false);
    setNewAlert({ name: '', threshold: 30, type: 'below' });
  };

  return (
    <div className={`${
      isDark ? 'bg-slate-800/50' : 'bg-white/50'
    } rounded-xl p-6 border border-slate-200/20 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Custom Alerts</h2>
          <span className={`${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
          } text-xs px-2 py-0.5 rounded-full`}>
            {alerts.filter(a => a.enabled).length} Active
          </span>
        </div>
        <Bell className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className={`${
            isDark ? 'bg-slate-700/30' : 'bg-slate-100'
          } p-4 rounded-lg flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${
                alert.type === 'below' ? 'text-green-500' : 'text-red-500'
              }`} />
              <div>
                <h3 className="font-medium">{alert.name}</h3>
                <p className="text-sm text-slate-500">
                  Threshold: {alert.threshold} Gwei
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={alert.enabled}
                  onChange={() => toggleAlert(alert.id, !alert.enabled)}
                  aria-label={`Toggle ${alert.name} alert`}
                />
                <div className="w-11 h-6 bg-slate-600 rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:bg-blue-500
                              after:content-[''] after:absolute after:top-[2px] 
                              after:left-[2px] after:bg-white after:rounded-full 
                              after:h-5 after:w-5 after:transition-all">
                </div>
              </label>
              
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 
                          text-red-500 transition-colors"
                aria-label={`Delete ${alert.name} alert`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {isAddingAlert ? (
          <form onSubmit={handleAddAlert} className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
            <div>
              <label htmlFor="alertName" className="block text-sm font-medium mb-1">
                Alert Name
              </label>
              <input
                id="alertName"
                type="text"
                value={newAlert.name}
                onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
                required
                placeholder="e.g., Low Gas Price Alert"
              />
            </div>

            <div>
              <label htmlFor="threshold" className="block text-sm font-medium mb-1">
                Threshold (Gwei)
              </label>
              <input
                id="threshold"
                type="number"
                value={newAlert.threshold}
                onChange={e => setNewAlert(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
                required
                min="1"
              />
            </div>

            <div>
              <label htmlFor="alertType" className="block text-sm font-medium mb-1">
                Alert Type
              </label>
              <select
                id="alertType"
                value={newAlert.type}
                onChange={e => setNewAlert(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'below' | 'above'
                }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
                required
              >
                <option value="below">Below Threshold</option>
                <option value="above">Above Threshold</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
                         hover:bg-blue-600 transition-colors"
              >
                Add Alert
              </button>
              <button
                type="button"
                onClick={() => setIsAddingAlert(false)}
                className="px-4 py-2 border border-slate-700 rounded-lg 
                         hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingAlert(true)}
            className="w-full flex items-center justify-center gap-2 p-3 
                     text-blue-500 rounded-lg border border-dashed 
                     border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Alert
          </button>
        )}
      </div>
    </div>
  );
}; 