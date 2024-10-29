import React from 'react';
import { Brain, TrendingDown, Clock, Zap } from 'lucide-react';

interface PredictionCardProps {
  predictedDrop: number;
  optimalTime: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ predictedDrop, optimalTime }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">AI Insights</h2>
        <Brain className="w-5 h-5 text-purple-500" />
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
          <div className="flex items-center text-green-600 mb-2">
            <TrendingDown className="w-4 h-4 mr-2" />
            <span className="font-semibold">Price Drop Expected</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-slate-500 mr-2" />
              <span className="text-slate-600">{optimalTime}</span>
            </div>
            <span className="text-green-600 font-semibold">-{predictedDrop}%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
          <h3 className="font-semibold mb-3 flex items-center text-slate-900">
            <Zap className="w-4 h-4 text-yellow-500 mr-2" />
            Smart Actions
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              <span className="text-sm text-slate-600">Wait until {optimalTime} for non-urgent transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              <span className="text-sm text-slate-600">Bundle multiple transactions together</span>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              <span className="text-sm text-slate-600">Use Layer 2 for small transfers</span>
            </li>
          </ul>
        </div>
      </div>

      <button className="mt-4 w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
        <Brain className="w-4 h-4 mr-2" />
        Get Custom Analysis
      </button>
    </div>
  );
};

export default PredictionCard;