import React, { useState, useEffect } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useGasPrice } from '../../hooks/useGasPrice';
import { gasService } from '../../services/gasService';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor
}) => {
  const { isDark } = useTheme();
  const [trend, setTrend] = useState<{ direction: 'up' | 'down', value: string } | null>(null);

  useEffect(() => {
    const fetchPriceChange = async () => {
      try {
        const { changePercent } = await gasService.getGasPriceChange();
        const direction = changePercent >= 0 ? 'up' : 'down';
        const formattedValue = `${Math.abs(changePercent).toFixed(1)}%`;
        setTrend({ direction, value: formattedValue });
      } catch (error) {
        console.error('Error fetching price change:', error);
      }
    };

    if (title === 'Current Gas') {
      fetchPriceChange();
    }
  }, [title, value]);

  const getLivePriceClass = () => {
    if (title === "Current Gas") {
      return `${isDark ? 'text-slate-400' : 'text-slate-600'} animate-pulse-slow`;
    }
    return isDark ? 'text-slate-400' : 'text-slate-600';
  };

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
            <span className={`text-xs ${title === "Current Gas" ? "animate-pulse-slow" : ""} ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {subtitle}
            </span>
            {trend && (
              <span className={`flex items-center text-xs ${
                trend.direction === 'up' 
                  ? isDark ? 'text-red-400' : 'text-red-600'
                  : isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {trend.direction === 'up' ? 
                  <TrendingUp className="w-3 h-3 mr-1" /> : 
                  <TrendingDown className="w-3 h-3 mr-1" />
                }
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