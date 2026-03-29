/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export interface BlockChartData {
  time: string;
  price: number;
  predictedLow: number;
  networkActivity: number;
  gasUsed: number;
  utilizationPercent: number;
  totalTransactions: number;
  eip1559Transactions: number;
  legacyTransactions: number;
  totalValueTransferred: number;
  networkCongestion: string;
  networkTrend: string;
  avgGasPrice: number;
  medianGasPrice: number;
  avgPriorityFee: number;
  medianPriorityFee: number;
  blockNumber: number;
}

export type TimeRange = '2h' | '4h' | '8h' | '24h' | '1w';

export const useBlockDataChart = (timeRange: TimeRange = '24h') => {
  const [chartData, setChartData] = useState<BlockChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processDataPoints = (data: BlockChartData[], maxPoints: number = 700) => {
    if (data.length <= maxPoints) return data;
    
    const lastDataPoint = data[data.length - 1];
    const remainingData = data.slice(0, -1);
    const skipFactor = Math.ceil(remainingData.length / (maxPoints - 1));
    
    const sampledData = remainingData.filter((_, index) => index % skipFactor === 0);
    return [...sampledData, lastDataPoint];
  };

  const fetchBlockData = async () => {
    try {
      const response = await apiRequest<{ data: BlockChartData[] }>(
        '/block-data',
        undefined,
        { range: timeRange }
      );

      const processedData = processDataPoints([...response.data].reverse());
      setChartData(processedData);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error fetching data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockData();
    const interval = setInterval(fetchBlockData, 10000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return { chartData, loading, error };
}; 
