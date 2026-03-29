import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

interface WhaleTransaction {
  address: string;
  totalBlocks: number;
  totalTransactions: number;
  totalValueETH: number;
  lastSeen: string;
}


export const useWhalesData = (page: number = 1, pageSize: number = 10) => {
  const [whales, setWhales] = useState<WhaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchWhales = async () => {
      try {
        const response = await apiRequest<{
          whales: WhaleTransaction[];
          totalCount: number;
        }>('/whales', undefined, { page, pageSize });

        setWhales(response.whales);
        setTotalCount(response.totalCount);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching whale data');
        setLoading(false);
      }
    };

    fetchWhales();
  }, [page, pageSize]);

  return { whales, loading, error, totalCount };
};
