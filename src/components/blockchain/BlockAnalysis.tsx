import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface BlockAnalysisProps {
  blockData: any;
}

interface TransactionAnalysis {
  averageGasPrice: string;
  totalTransactions: number;
  totalGasUsed: string;
  highestGasPrice: string;
  lowestGasPrice: string;
  transactionsByGasPrice: any[];
}

const BlockAnalysis: React.FC<BlockAnalysisProps> = ({ blockData }) => {
  const { isDark } = useTheme();

  const analysis: TransactionAnalysis = useMemo(() => {
    if (!blockData?.data?.transactions) return {} as TransactionAnalysis;

    const transactions = blockData.data.transactions;
    
    // Convertir precios de gas de hex a decimal
    const gasPrices = transactions.map((tx: any) => 
      parseInt(tx.gasPrice, 16) / 1e9
    );

    // Agrupar transacciones por rango de precio de gas
    const priceRanges: { [key: string]: number } = {};
    gasPrices.forEach((price: number) => {
      const range = Math.floor(price / 5) * 5;
      priceRanges[range] = (priceRanges[range] || 0) + 1;
    });

    const chartData = Object.entries(priceRanges)
      .map(([range, count]) => ({
        range: `${range}-${Number(range) + 5} Gwei`,
        count
      }))
      .sort((a, b) => Number(a.range.split('-')[0]) - Number(b.range.split('-')[0]));

    return {
      averageGasPrice: (gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length).toFixed(2),
      totalTransactions: transactions.length,
      totalGasUsed: parseInt(blockData.data.gasUsed, 16).toLocaleString(),
      highestGasPrice: Math.max(...gasPrices).toFixed(2),
      lowestGasPrice: Math.min(...gasPrices).toFixed(2),
      transactionsByGasPrice: chartData
    };
  }, [blockData]);

  if (!blockData?.data) return null;

  return (
    <div className={`p-4 rounded-xl border ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/95 border-slate-200'
    }`}>
      <h2 className="text-lg font-semibold mb-4">Block Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500">Total Transactions</div>
          <div className="text-xl font-semibold">{analysis.totalTransactions}</div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500">Average Gas Price</div>
          <div className="text-xl font-semibold">{analysis.averageGasPrice} Gwei</div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500">Total Gas Used</div>
          <div className="text-xl font-semibold">{analysis.totalGasUsed}</div>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analysis.transactionsByGasPrice}>
            <XAxis 
              dataKey="range" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BlockAnalysis; 