import React from 'react';
import { Activity } from 'lucide-react';

const GasFeeChart: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <Activity className="w-16 h-16 text-slate-600" />
        <p className="text-slate-500 ml-4">Chart visualization will be implemented with your preferred charting library</p>
      </div>
      <div className="h-[300px]"></div>
    </div>
  );
};

export default GasFeeChart;