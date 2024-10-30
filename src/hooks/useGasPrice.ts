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
      const predictedLow = priceInGwei * 0.85;
      
      await db.execute({
        sql: `INSERT INTO gas_prices (price, predicted_low, network_activity) 
              VALUES (?, ?, ?)`,
        args: [priceInGwei, predictedLow, 10]
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error silencioso o manejo alternativo si es necesario
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

        if (data.error) {
          setError(data.error.message);
          setGasPrice(null);
        } else if (data.result) {
          setGasPrice(data.result);
          await saveGasPrice(data.result);
          setError(null);
        } else {
          setError('Invalid response format');
          setGasPrice(null);
        }
      } catch (err) {
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
