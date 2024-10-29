import React from 'react';
import { Activity } from 'lucide-react';
import { GasData } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface GasChartProps {
  data: GasData[];
}


const GasChart: React.FC<GasChartProps> = ({ data }) => {
  const { isDark } = useTheme();

  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload?.[0]?.value) {
      const value = payload[0].value as number;
      return (
        <div className={`
          ${isDark ? 'bg-slate-800' : 'bg-white'}
          p-2 rounded-lg shadow-lg
          ${isDark ? 'border-slate-700' : 'border-slate-200'}
          border
        `}>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {label}
          </p>
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {`${value.toFixed(2)} Gwei`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="relative h-[300px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-16 h-16 text-slate-600" />
          <p className="text-slate-500 ml-4">Loading gas data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'} 
          />
          <XAxis 
            dataKey="time" 
            stroke={isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(71, 85, 105, 0.8)'}
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke={isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(71, 85, 105, 0.8)'}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={isDark ? '#60a5fa' : '#3b82f6'}
            strokeWidth={2}
            dot={false}
            animateNewValues={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GasChart;