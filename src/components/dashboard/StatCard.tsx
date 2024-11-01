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
  onClick?: () => void;
  isSelected?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  chartData?: Array<{
    time: string;
    price: number;
    networkLoad: number;
    transactions: number;
    valueTransferred: number;
  }>;
  dataKey?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  onClick,
  isSelected,
  trend}) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-6 rounded-xl
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer
        ${isDark 
          ? 'bg-slate-800/50 text-white' 
          : 'bg-white text-slate-900 border border-slate-200'}
        shadow-sm hover:shadow-md
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="space-y-2"
        >
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {title}
          </p>
          <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {value}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </span>
            {trend && (
              <span className={`
                flex items-center text-xs font-medium
                ${trend.isPositive ? 
                  'text-emerald-600' : 'text-red-600'
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
            isDark ? 'bg-slate-700' : 'bg-slate-50 border border-slate-100'
          }`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatCard;