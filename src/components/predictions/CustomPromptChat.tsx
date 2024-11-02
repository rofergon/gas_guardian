import React from 'react';
import { Brain, Send, X } from 'lucide-react';
import { useCustomPrompt } from '../../hooks/useCustomPrompt';
import { useTheme } from '../../hooks/useTheme';
import type { BlockChartData } from '../../hooks/useBlockDataChart';

interface CustomPromptChatProps {
  gasData: BlockChartData[];
}

const LoadingDots = () => (
  <div className="flex space-x-1 items-center">
    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
  </div>
);

const CustomPromptChat: React.FC<CustomPromptChatProps> = ({ gasData }) => {
  const { isDark } = useTheme();
  const {
    customPrompt,
    setCustomPrompt,
    showCustomInput,
    setShowCustomInput,
    loading,
    error,
    handleCustomRequest,
    customResponse
  } = useCustomPrompt(gasData);

  return (
    <div className={`
      ${isDark ? 'bg-slate-800/50' : 'bg-white/95'} 
      backdrop-blur-sm p-4 rounded-xl border border-slate-700/50
      transition-all duration-300 ease-in-out
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <Brain className={`
            w-4 h-4 text-purple-500
            ${loading ? 'animate-pulse' : ''}
          `} />
        </div>
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`
            px-2.5 py-1.5 rounded-lg text-sm
            ${isDark ? 
              'bg-slate-700 hover:bg-slate-600' : 
              'bg-slate-200 hover:bg-slate-300'
            }
            transition-all duration-200 flex items-center gap-1
            hover:scale-105 active:scale-95
          `}
        >
          {showCustomInput ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <>
              <Brain className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleCustomRequest} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask about gas prices and network conditions..."
            className={`
              flex-1 px-3 py-1.5 rounded-lg text-sm
              ${isDark ? 
                'bg-slate-700/50 text-white placeholder-slate-400' : 
                'bg-white text-slate-900 placeholder-slate-500'
              }
              border ${isDark ? 'border-slate-600' : 'border-slate-300'}
              focus:outline-none focus:ring-1 focus:ring-blue-500
              transition-all duration-200
              ${loading ? 'opacity-70' : ''}
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
                'bg-slate-600 cursor-not-allowed opacity-50' : 
                'bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95'
              }
              text-white transition-all duration-200
            `}
          >
            {loading ? (
              <LoadingDots />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-3 p-2 text-sm bg-red-500/10 border border-red-500/20 rounded-lg text-red-500
          animate-fadeIn">
          {error}
        </div>
      )}

      {(loading || customResponse) && (
        <div className={`
          p-4 bg-slate-700/30 rounded-lg
          transition-all duration-300
          ${loading ? 'animate-pulse' : 'animate-fadeIn'}
        `}>
          <h3 className="font-semibold mb-3 flex items-center">
            <Brain className="w-4 h-4 text-purple-500 mr-2" />
            {loading ? 'Generating response...' : 'Response'}
          </h3>
          <div className={`
            text-slate-300 whitespace-pre-wrap
            ${loading ? 'opacity-50' : ''}
          `}>
            {loading ? (
              <div className="flex items-center gap-2">
                <span>AI is processing your question</span>
                <LoadingDots />
              </div>
            ) : (
              customResponse
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPromptChat; 