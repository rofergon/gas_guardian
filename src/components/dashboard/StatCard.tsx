import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        p-6 rounded-xl border transition-all duration-200
        ${isDark ? 
          'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50' : 
          'bg-white/95 border-slate-200/50 hover:bg-slate-50/90'
        }
        backdrop-blur-sm shadow-lg
      `}
    >
      <div className="flex items-start justify-between">
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="space-y-2"
        >
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight">
            {value}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">
              {subtitle}
            </span>
            {trend && (
              <span className={`
                flex items-center text-xs font-medium
                ${trend.isPositive ? 
                  'text-green-500' : 'text-red-500'
                }
              `}>
                {trend.isPositive ? '↑' : '↓'} 
                {trend.value}%
              </span>
            )}
          </div>
        </motion.div>
        <motion.div
          whileHover={{ rotate: 15 }}
          className={`p-3 rounded-full ${
            isDark ? 'bg-slate-700/50' : 'bg-slate-100'
          }`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatCard;