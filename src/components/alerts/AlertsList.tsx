import React from 'react';
import { Bell } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { useTheme } from '../../hooks/useTheme';

export const AlertsList: React.FC = () => {
  const { alerts, loading, toggleAlert } = useAlerts();
  const { isDark } = useTheme();

  if (loading) {
    return <div>Cargando alertas...</div>;
  }

  return (
    <div className={`${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-slate-200'
    } rounded-xl p-6 border backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">Alertas Personalizadas</h2>
          <span className={`${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
          } text-xs px-2 py-0.5 rounded-full`}>
            {alerts.filter(a => a.enabled).length} Activas
          </span>
        </div>
        <Bell className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className={`${
            isDark ? 'bg-slate-700/30' : 'bg-slate-100'
          } p-4 rounded-lg flex items-center justify-between`}>
            <div>
              <h3 className="font-medium">{alert.name}</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {alert.type === 'below' ? 'Por debajo de' : 'Por encima de'} {alert.threshold} Gwei
              </p>
            </div>
            <div className="relative inline-flex items-center">
              <label 
                htmlFor={`alert-toggle-${alert.id}`}
                className="sr-only"
              >
                Toggle alert for {alert.name}
              </label>
              <input
                type="checkbox"
                id={`alert-toggle-${alert.id}`}
                className="sr-only peer"
                checked={alert.enabled}
                onChange={() => toggleAlert(alert.id, !alert.enabled)}
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
