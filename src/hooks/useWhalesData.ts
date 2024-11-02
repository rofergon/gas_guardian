import { useEffect, useState } from 'react';
import { createClient } from '@libsql/client';

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
        const client = createClient({
          url: import.meta.env.VITE_TURSO_URL,
          authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
        });

        const offset = (page - 1) * pageSize;

        // Primero obtenemos el total de registros
        const countResult = await client.execute(`
          SELECT COUNT(DISTINCT from_address) as total
          FROM transactions 
          WHERE value > 0.5
        `);
        
        setTotalCount(Number(countResult.rows[0].total) || 0);

        const result = await client.execute(`
          SELECT 
            from_address as address,
            COUNT(DISTINCT block_number) as totalBlocks,
            COUNT(*) as totalTransactions,
            SUM(value) as totalValueETH,
            MAX(datetime(created_at)) as lastSeen
          FROM transactions 
          WHERE value > 0.5
          GROUP BY from_address
          ORDER BY totalValueETH DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `);

        const formattedWhales = result.rows.map((row) => ({
          address: row.address as string,
          totalBlocks: Number(row.totalBlocks),
          totalTransactions: Number(row.totalTransactions),
          totalValueETH: parseFloat(row.totalValueETH as string),
          lastSeen: row.lastSeen as string,
        }));

        setWhales(formattedWhales);
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
