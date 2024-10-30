import { useCallback } from 'react';

export const useQuickNode = () => {
  const fetchBlockData = useCallback(async (blockParam: 'latest' | string) => {
    try {
      const response = await fetch(import.meta.env.VITE_QUICKNODE_HTTP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [
            blockParam === 'latest' ? 'latest' : `0x${parseInt(blockParam).toString(16)}`,
            true
          ],
          id: 1
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return { data: data.result };
    } catch (error) {
      console.error('Error fetching block data:', error);
      return null;
    }
  }, []);

  return { fetchBlockData };
};
