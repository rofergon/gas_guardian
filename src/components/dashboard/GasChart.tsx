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
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem'
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