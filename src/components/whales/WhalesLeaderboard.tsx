import { TrendingUp, ChevronLeft, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useState } from 'react';
import { useWhalesData } from '../../hooks/useWhalesData';

const WhalesLeaderboard = () => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
   
  const { whales, loading, totalCount } = useWhalesData(currentPage, pageSize);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const totalPages = Math.ceil(totalCount / pageSize);

  const formatAddress = (address: string) => 
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const openEtherscan = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg animate-pulse`}>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Whales Leaderboard
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real Time Data Streaming
          </span>
          <div className="relative">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute -inset-0.5 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`text-left border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <th className={`pb-2 pr-4 w-16 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>#</th>
              <th className={`pb-2 pr-4 w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Address</th>
              <th className={`pb-2 pr-4 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Blocks</th>
              <th className={`pb-2 pr-4 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Txs</th>
              <th className={`pb-2 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Value (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {whales.map((whale, index) => (
              <tr 
                key={whale.address}
                className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} last:border-0`}
              >
                <td className={`py-3 pr-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {((currentPage - 1) * pageSize) + index + 1}
                </td>
                <td className={`py-3 pr-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEtherscan(whale.address)}
                      className="font-mono hover:text-blue-500 flex items-center gap-1"
                    >
                      {formatAddress(whale.address)}
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyAddress(whale.address)}
                      className={`p-1 rounded hover:bg-slate-700 transition-colors ${
                        copiedAddress === whale.address ? 'text-green-500' : 'text-slate-400'
                      }`}
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className={`py-3 pr-4 text-right ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {whale.totalBlocks}
                </td>
                <td className={`py-3 pr-4 text-right ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {whale.totalTransactions}
                </td>
                <td className={`py-3 text-right ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {whale.totalValueETH.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
        </span>
            // Start of Selection
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                title="Previous page"
                className={`p-2 rounded ${
                  isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            } ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          </button>
          
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            title="Next page"
            className={`p-2 rounded ${
              isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            } ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhalesLeaderboard; 