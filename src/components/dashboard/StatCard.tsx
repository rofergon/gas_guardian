import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useGasPrice } from '../../hooks/useGasPrice';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  progress?: {
    value: number;
    color: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend}) => {
  const { isDark } = useTheme();
  useGasPrice(1);


  return (
    <div className={`${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50' 
        : 'bg-white/95 border-slate-200/50 hover:bg-slate-50/90'
    } backdrop-blur-sm p-6 rounded-xl border transition-colors shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</p>
          <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </span>
            {trend && (
              <span className={`flex items-center text-xs ${
                trend.direction === 'up' 
                  ? isDark ? 'text-red-400' : 'text-red-600'
                  : isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {trend.direction === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.value}
              </span>
            )}
          </div>
        </div>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  );
};

export default StatCard;