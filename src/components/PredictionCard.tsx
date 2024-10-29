import React from 'react';
import { Brain, TrendingDown } from 'lucide-react';

const PredictionCard: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">AI Predictions</h2>
        <Brain className="w-5 h-5 text-purple-500" />
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center text-green-500 mb-2">
            <TrendingDown className="w-4 h-4 mr-2" />
            <span className="font-semibold">Expected Drop</span>
          </div>
          <p className="text-slate-300">Gas fees are predicted to drop by 20% in the next 3 hours.</p>
        </div>

        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h3 className="font-semibold mb-2">Recommended Actions</h3>
          <ul className="space-y-2 text-slate-300">
            <li>• Delay non-urgent transactions until 2:00 AM</li>
            <li>• Bundle multiple transactions for better efficiency</li>
            <li>• Consider using Layer 2 solutions for smaller transfers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;