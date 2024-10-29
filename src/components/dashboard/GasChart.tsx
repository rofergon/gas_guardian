import React from 'react';
import { Activity } from 'lucide-react';
import { GasData } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GasChartProps {
  data: GasData[];
}

const GasChart: React.FC<GasChartProps> = ({ data }) => {
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
    <div className="h-[300px] bg-slate-100 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(71, 85, 105, 0.8)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="rgba(71, 85, 105, 0.8)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid rgba(203, 213, 225, 1)',
              borderRadius: '0.5rem',
              padding: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GasChart;