import { useState, useEffect } from 'react';
import { createClient } from '@libsql/client';

interface GasPriceResponse {
  jsonrpc: string;
  id: number;
  result?: string;
  error?: {
    message: string;
    code: number;
  };
}

const db = createClient({
  url: import.meta.env.VITE_TURSO_URL as string,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN as string,
});

export const useGasPrice = (chainId: number = 1) => {
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveGasPrice = async (price: string) => {
    try {
      const priceInGwei = parseInt(price, 16) / 1e9;
      const predictedLow = priceInGwei * 0.85; // Estimación simple del precio bajo
      
      await db.execute({
        sql: `INSERT INTO gas_prices (price, predicted_low, network_activity) 
              VALUES (?, ?, ?)`,
        args: [priceInGwei, predictedLow, 10]
      });
      
      console.log('Gas price saved to database:', priceInGwei);
    } catch (err) {
      console.error('Error saving gas price to database:', err);
    }
  };

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

        const data: GasPriceResponse = await response.json();
        console.log('API Response:', data);

        if (data.error) {
          console.error('QuickNode API error:', data.error);
          setError(data.error.message);
          setGasPrice(null);
        } else if (data.result) {
          console.log('Gas Price Result:', data.result);
          setGasPrice(data.result);
          await saveGasPrice(data.result);
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
