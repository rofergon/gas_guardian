import { useState, useEffect } from 'react';
import { GasData } from '../types';
import { useGasPrice } from './useGasPrice';

export const useGasData = () => {
  const [gasData, setGasData] = useState<GasData[]>([]);
  const { gasPrice, isLoading } = useGasPrice(1);

  const formatGasPrice = (price: string | null): number => {
    if (!price) return 0;
    try {
      const cleanHex = price.startsWith('0x') ? price : `0x${price}`;
      const priceInWei = BigInt(cleanHex);
      return Number(priceInWei) / 1e9;
    } catch (error) {
      console.error('Error formatting gas price:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (!isLoading && gasPrice) {
      const currentPrice = formatGasPrice(gasPrice);
      const currentTime = new Date().toLocaleTimeString();

      setGasData(prev => {
        // Mantener solo las últimas 24 lecturas
        const newData = [...prev, { time: currentTime, price: currentPrice }];
        if (newData.length > 24) {
          return newData.slice(-24);
        }
        return newData;
      });
    }
  }, [gasPrice, isLoading]);

  return {
    currentGwei: formatGasPrice(gasPrice),
    predictedLow: formatGasPrice(gasPrice) * 0.85, // Estimación simple
    gasData,
    networkActivity: Math.min(100, Math.floor(formatGasPrice(gasPrice) / 2))
  };
};