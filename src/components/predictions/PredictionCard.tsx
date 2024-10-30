import React, { useState } from 'react';
import { Brain, TrendingDown, Clock, Zap, RefreshCw, Send, X, Activity } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { aiService } from '../../services/aiService';

interface PredictionCardProps {
  gasData: { time: string; price: number }[];
}


const PredictionCard: React.FC<PredictionCardProps> = ({ gasData }) => {
  const { isDark } = useTheme();
  const [predictions, setPredictions] = useState({
    predictedDrop: 0,
    optimalTime: '',
    recommendations: [] as string[],
    marketCondition: '',
    graphAnalysis: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const generatePredictions = async (customRequest?: string) => {
    if (gasData.length === 0) {
      setError('Insufficient data to generate predictions');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newPredictions = await aiService.generatePredictions(gasData, customRequest);
      
      setPredictions(newPredictions);
      if (customRequest) {
        setCustomPrompt('');
        setShowCustomInput(false);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err: Error | unknown) {
      setError('Could not generate predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      generatePredictions(customPrompt);
    }
  };

  return (
    <div className={`${
      isDark ? 'bg-slate-800/50' : 'bg-white/95'
    } backdrop-blur-sm p-4 rounded-xl border border-slate-700/50`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">AI Insights</h2>
          <Brain className="w-4 h-4 text-purple-500" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`
              px-2.5 py-1.5 rounded-lg text-sm
              ${isDark ? 
                'bg-slate-700 hover:bg-slate-600' : 
                'bg-slate-200 hover:bg-slate-300'
              }
              transition-colors duration-200 flex items-center gap-1
            `}
          >
            {showCustomInput ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <>
                <Brain className="w-3.5 h-3.5" />
                <span>Custom</span>
              </>
            )}
          </button>
          <button
            onClick={() => generatePredictions()}
            disabled={loading}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm
              transition-colors duration-200
              ${loading ? 
                'bg-slate-600 cursor-not-allowed' : 
                'bg-blue-500 hover:bg-blue-600'
              }
              text-white
            `}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating...' : 'Generate Insights'}</span>
          </button>
        </div>
      </div>

      {showCustomInput && (
        <form onSubmit={handleCustomRequest} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ask about gas prices..."
              className={`
                flex-1 px-3 py-1.5 rounded-lg text-sm
                ${isDark ? 
                  'bg-slate-700/50 text-white placeholder-slate-400' : 
                  'bg-white text-slate-900 placeholder-slate-500'
                }
                border ${isDark ? 'border-slate-600' : 'border-slate-300'}
                focus:outline-none focus:ring-1 focus:ring-blue-500
              `}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !customPrompt.trim()}
              className={`
                px-3 py-1.5 rounded-lg text-sm
                flex items-center gap-1
                ${loading || !customPrompt.trim() ? 
                  'bg-slate-600 cursor-not-allowed' : 
                  'bg-green-500 hover:bg-green-600'
                }
                text-white transition-colors duration-200
              `}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-3 p-2 text-sm bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}
      
      {!error && (predictions.recommendations.length > 0 ? (
        <div className="space-y-4">
          {!customPrompt ? (
            <>
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-slate-100'
              }`}>
                <div className="flex items-center text-green-500 mb-2">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Expected Drop</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-slate-400 mr-2" />
                    <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {predictions.optimalTime}
                    </span>
                  </div>
                  <span className="text-green-500 font-semibold">
                    -{predictions.predictedDrop}%
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-slate-100'
              }`}>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Recommendations
                </h3>
                <ul className={`space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {predictions.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-slate-400 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-slate-100'
              }`}>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Activity className="w-4 h-4 text-blue-500 mr-2" />
                  Market Analysis
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Market Condition:{' '}
                    </span>
                    <span className={`font-medium ${
                      predictions.marketCondition === 'bullish' ? 'text-green-500' :
                      predictions.marketCondition === 'bearish' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {predictions.marketCondition?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Analysis:{' '}
                    </span>
                    <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {predictions.graphAnalysis}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <Brain className="w-4 h-4 text-purple-500 mr-2" />
                Response
              </h3>
              <div className="text-slate-300 whitespace-pre-wrap">
                {predictions.recommendations[0]}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-8">
          Click "Generate Prediction" to get insights
        </div>
      ))}
    </div>
  );
};

export default PredictionCard;