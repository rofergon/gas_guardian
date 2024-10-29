import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
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
  trend,
  progress
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-slate-700/50 hover:bg-slate-700/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-slate-400">{subtitle}</span>
            {trend && (
              <span className={`flex items-center text-xs ${trend.direction === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {trend.direction === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.value}
              </span>
            )}
          </div>
          {progress && (
            <div className="mt-3 w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`${progress.color} h-2 rounded-full transition-all duration-500 ease-in-out`} 
                style={{ width: `${progress.value}%` }}
              />
            </div>
          )}
        </div>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  );
};

export default StatCard;