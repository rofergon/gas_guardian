import React from 'react';
import { Brain, TrendingDown } from 'lucide-react';

interface AIPrediction {
  predictedDrop: number;
  optimalTime: string;
  confidence: number;
  recommendations: string[];
  marketCondition: string;
  graphAnalysis: string;
}

const PredictionCard: React.FC = () => {
  const prediction: AIPrediction = {
    predictedDrop: 20,
    optimalTime: "2:00 AM",
    confidence: 90,
    recommendations: ["Delay non-urgent transactions until 2:00 AM", "Bundle multiple transactions for better efficiency", "Consider using Layer 2 solutions for smaller transfers"],
    marketCondition: "Stable",
    graphAnalysis: "Gas fees are predicted to drop by 20% in the next 3 hours."
  };

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
          <p className="text-slate-300">{prediction.graphAnalysis}</p>
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

      <div className="market-analysis">
        <h4>Market Condition</h4>
        <p>{prediction.marketCondition}</p>
        
        <h4>Graph Analysis</h4>
        <p>{prediction.graphAnalysis}</p>
      </div>
    </div>
  );
};

export default PredictionCard;