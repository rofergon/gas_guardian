import { useState, useEffect } from 'react';
import { createClient } from '@libsql/client';

interface BlockChartData {
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
}

export const useBlockDataChart = () => {
  const [chartData, setChartData] = useState<BlockChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = createClient({
    url: import.meta.env.VITE_TURSO_URL as string,
    authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN as string,
  });

  const fetchBlockData = async () => {
    try {
      const result = await client.execute({
        sql: `
          SELECT 
            timestamp as time,
            base_fee_gwei as price,
            base_fee_gwei * 0.85 as predicted_low,
            utilization_percent as network_activity,
            gas_used,
            utilization_percent,
            total_transactions,
            eip1559_transactions,
            legacy_transactions,
            total_value_transferred,
            network_congestion,
            network_trend,
            avg_gas_price,
            median_gas_price,
            avg_priority_fee,
            median_priority_fee
          FROM block_data 
          ORDER BY timestamp DESC 
          LIMIT 100
        `,
        args: []
      });

      const formattedData = result.rows.map(row => ({
        time: row.time as string,
        price: Number(row.price),
        predictedLow: Number(row.predicted_low),
        networkActivity: Number(row.network_activity),
        gasUsed: Number(row.gas_used),
        utilizationPercent: Number(row.utilization_percent),
        totalTransactions: Number(row.total_transactions),
        eip1559Transactions: Number(row.eip1559_transactions),
        legacyTransactions: Number(row.legacy_transactions),
        totalValueTransferred: Number(row.total_value_transferred),
        networkCongestion: row.network_congestion as string,
        networkTrend: row.network_trend as string,
        avgGasPrice: Number(row.avg_gas_price),
        medianGasPrice: Number(row.median_gas_price),
        avgPriorityFee: Number(row.avg_priority_fee),
        medianPriorityFee: Number(row.median_priority_fee)
      }));

      setChartData(formattedData.reverse());
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockData();
    const interval = setInterval(fetchBlockData, 15000);
    return () => clearInterval(interval);
  }, []);

  return { chartData, loading, error };
}; 