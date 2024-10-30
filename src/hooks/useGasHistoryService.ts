import { useEffect, useCallback } from 'react';
import { createClient } from '@libsql/client';
import { useQuickNode } from './useQuickNode';

const client = createClient({
  url: import.meta.env.VITE_TURSO_URL as string,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN as string,
});

export const useGasHistoryService = () => {
  const { fetchBlockData } = useQuickNode();

  const fetchAndSaveGasData = useCallback(async () => {
    try {
      const latestBlock = await fetchBlockData('latest');
      
      if (latestBlock?.data) {
        const blockNumber = parseInt(latestBlock.data.number, 16);
        const totalGasUsed = parseInt(latestBlock.data.gasUsed, 16);
        
        await client.execute({
          sql: `INSERT INTO gas_history (block_number, total_gas_used) VALUES (?, ?)`,
          args: [blockNumber, totalGasUsed]
        });

        console.log('Gas data saved:', { blockNumber, totalGasUsed });
      }
    } catch (error) {
      console.error('Error in fetchAndSaveGasData:', error);
    }
  }, [fetchBlockData]);

  const getLastRecords = useCallback(async () => {
    try {
      const result = await client.execute({
        sql: `SELECT * FROM gas_history ORDER BY timestamp DESC LIMIT 5`,
        args: []
      });
      console.log('Últimos registros:', result.rows);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  }, []);

  useEffect(() => {
    fetchAndSaveGasData();
    const interval = setInterval(fetchAndSaveGasData, 15000);
    const checkInterval = setInterval(getLastRecords, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(checkInterval);
    };
  }, [fetchAndSaveGasData, getLastRecords]);

  return { fetchAndSaveGasData, getLastRecords };
}; 