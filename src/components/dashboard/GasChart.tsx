import React from 'react';
import { Activity } from 'lucide-react';
import { GasData } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface GasChartProps {
  data: GasData[];
}

const GasChart: React.FC<GasChartProps> = ({ data }) => {
  const { isDark } = useTheme();

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
    <div className={`h-[300px] ${
      isDark ? 'bg-slate-800/50' : 'bg-slate-100'
    } rounded-xl p-4`}>
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
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : 'white',
              border: isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 1)',
              borderRadius: '0.5rem',
              padding: '8px',
              color: isDark ? 'white' : 'black'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={isDark ? '#60a5fa' : '#3b82f6'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GasChart;