import { Bell, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface Alert {
  id: string;
  name: string;
  threshold: number;
  isActive: boolean;
}

const CustomAlerts = () => {
  const { isDark } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', name: 'Low Gas Alert', threshold: 10, isActive: true },
    { id: '2', name: 'Medium Gas Alert', threshold: 20, isActive: false },
  ]);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    threshold: 0
  });

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleAddAlert = () => {
    if (newAlert.name && newAlert.threshold > 0) {
      const alert: Alert = {
        id: Date.now().toString(),
        name: newAlert.name,
        threshold: newAlert.threshold,
        isActive: true
      };
      
      setAlerts([...alerts, alert]);
      setNewAlert({ name: '', threshold: 0 });
      setIsAddingAlert(false);
    }
  };

  return (
    <div className={`rounded-xl p-4 ${
      isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold">Custom Alerts</h2>
        </div>
        <span className="text-sm text-blue-500">{alerts.filter(a => a.isActive).length} Active</span>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`flex items-center justify-between rounded-lg p-3 ${
              isDark ? 'bg-slate-700/50' : 'bg-slate-100'
            }`}
          >
            <div>
              <h3 className="font-medium">{alert.name}</h3>
              <p className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Threshold: {alert.threshold} Gwei
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleAlert(alert.id)}
                aria-label={`${alert.isActive ? 'Disable' : 'Enable'} ${alert.name}`}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  alert.isActive ? 'bg-blue-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    alert.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <button
                onClick={() => handleDeleteAlert(alert.id)}
                className={`${
                  isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500'
                } transition-colors`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddingAlert ? (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Alert Name"
            value={newAlert.name}
            onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
            className={`w-full p-2 rounded-lg ${
              isDark ? 'bg-slate-700 text-white placeholder-slate-400' : 'bg-slate-100 text-slate-900 placeholder-slate-500'
            }`}
          />
          <input
            type="number"
            placeholder="Threshold (Gwei)"
            value={newAlert.threshold}
            onChange={(e) => setNewAlert({ ...newAlert, threshold: Number(e.target.value) })}
            className={`w-full p-2 rounded-lg ${
              isDark ? 'bg-slate-700 text-white placeholder-slate-400' : 'bg-slate-100 text-slate-900 placeholder-slate-500'
            }`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddAlert}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingAlert(false)}
              className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingAlert(true)}
          className="mt-4 w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors"
        >
          + Add New Alert
        </button>
      )}
    </div>
  );
};

export default CustomAlerts; 