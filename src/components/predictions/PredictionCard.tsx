import React from 'react';
import { Brain, TrendingDown, Clock, Zap } from 'lucide-react';

interface PredictionCardProps {
  predictedDrop: number;
  optimalTime: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ predictedDrop, optimalTime }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">AI Insights</h2>
        <Brain className="w-5 h-5 text-purple-500" />
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center text-green-500 mb-2">
            <TrendingDown className="w-4 h-4 mr-2" />
            <span className="font-semibold">Price Drop Expected</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-slate-300">{optimalTime}</span>
            </div>
            <span className="text-green-400 font-semibold">-{predictedDrop}%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center">
            <Zap className="w-4 h-4 text-yellow-500 mr-2" />
            Smart Actions
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              <span className="text-sm text-slate-300">Wait until {optimalTime} for non-urgent transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              <span className="text-sm text-slate-300">Bundle multiple transactions together</span>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              <span className="text-sm text-slate-300">Use Layer 2 for small transfers</span>
            </li>
          </ul>
        </div>
      </div>

      <button className="mt-4 w-full py-2 px-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
        <Brain className="w-4 h-4 mr-2" />
        Get Custom Analysis
      </button>
    </div>
  );
};

export default PredictionCard;