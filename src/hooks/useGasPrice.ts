import { useState, useEffect } from 'react';

interface GasPriceResponse {
  jsonrpc: string;
  id: number;
  result: string;
}

export const useGasPrice = (chainId: number = 1) => {
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_QUICKNODE_HTTP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_gasPrice',
            params: []
          })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (data.error) {
          console.error('QuickNode API error:', data.error);
          setError(data.error.message);
          setGasPrice(null);
        } else if (data.result) {
          console.log('Gas Price Result:', data.result);
          setGasPrice(data.result);
          setError(null);
        } else {
          setError('Invalid response format');
          setGasPrice(null);
        }
      } catch (err) {
        console.error('Gas price fetch error:', err);
        setError(err instanceof Error ? err.message : 'Error fetching gas price');
        setGasPrice(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 30000);
    return () => clearInterval(interval);
  }, [chainId]);

  return { gasPrice, isLoading, error };
};
