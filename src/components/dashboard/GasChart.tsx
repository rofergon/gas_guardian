import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface GasChartProps {
  data: Array<{
    time: string;
    price: number;
    predictedLow: number;
  }>;
}

const GasChart: React.FC<GasChartProps> = ({ data }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className={`text-${isDark ? 'slate-400' : 'slate-600'}`}>
          Loading gas data...
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
        <XAxis 
          dataKey="time" 
          stroke={isDark ? '#94a3b8' : '#64748b'}
          tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
        />
        <YAxis 
          stroke={isDark ? '#94a3b8' : '#64748b'}
          tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
          }}
          labelStyle={{ color: isDark ? '#94a3b8' : '#64748b' }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="predictedLow" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GasChart;