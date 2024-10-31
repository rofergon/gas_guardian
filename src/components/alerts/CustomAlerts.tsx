import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';



export const CustomAlerts: React.FC = () => {
  const { isDark } = useTheme();
  const { alerts, deleteAlert, toggleAlert } = useAlerts();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`
        rounded-xl p-6 border backdrop-blur-sm
        ${isDark ? 
          'bg-slate-800/50 border-slate-700/50' : 
          'bg-white/50 border-slate-200'
        }
      `}
    >
      <motion.div 
        variants={itemVariants}
        className="space-y-4"
      >
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`
              p-4 rounded-lg transition-all duration-200
              ${isDark ? 
                'bg-slate-700/30 hover:bg-slate-700/50' : 
                'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
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
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}; 