import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface GasAnalyticsProps {
  gasData: {
    timestamp: string;
    totalGasUsed: number;
  }[];
}

const GasAnalytics: React.FC<GasAnalyticsProps> = ({ gasData }) => {
  const { isDark } = useTheme();

  return (
    <div className={`p-4 rounded-xl border ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/95 border-slate-200'
    }`}>
      <h2 className="text-lg font-semibold mb-4">Gas Usage Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500">Average Gas Used</div>
          <div className="text-xl font-semibold">
            {(gasData.reduce((acc, curr) => acc + curr.totalGasUsed, 0) / gasData.length).toLocaleString()}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500">Highest Gas Usage</div>
          <div className="text-xl font-semibold">
            {Math.max(...gasData.map(d => d.totalGasUsed)).toLocaleString()}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500">Latest Gas Used</div>
          <div className="text-xl font-semibold">
            {gasData[gasData.length - 1]?.totalGasUsed.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={gasData}>
            <XAxis 
              dataKey="timestamp" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalGasUsed" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GasAnalytics; 