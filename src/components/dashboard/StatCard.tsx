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
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 hover:bg-slate-50/90 transition-colors shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-600">{title}</p>
          <h3 className="text-2xl font-semibold text-slate-900">{value}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">{subtitle}</span>
            {trend && (
              <span className={`flex items-center text-xs ${trend.direction === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
                {trend.direction === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.value}
              </span>
            )}
          </div>
          {progress && (
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
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