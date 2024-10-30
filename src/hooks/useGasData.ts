/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { GasData } from '../types';
import { useGasPrice } from './useGasPrice';
import { db } from '../lib/db';
import { alertService } from '../services/alertService';

export const useGasData = () => {
  const [gasData, setGasData] = useState<GasData[]>([]);
  const [timeRange, setTimeRange] = useState<'24H' | '1W'>('24H');
  const { gasPrice, isLoading } = useGasPrice(1);

  const formatGasPrice = (price: string | null): number => {
    if (!price) return 0;
    try {
      const cleanHex = price.startsWith('0x') ? price : `0x${price}`;
      const priceInWei = BigInt(cleanHex);
      return parseFloat((Number(priceInWei) / 1e9).toFixed(9));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 0;
    }
  };

  const loadHistoricalData = async () => {
    try {
      const query = timeRange === '24H' 
        ? `SELECT 
            strftime('%H:%M', timestamp) as time,
            ROUND(price, 9) as price,
            network_activity,
            ROUND(predicted_low, 9) as predicted_low
          FROM gas_prices 
          WHERE timestamp >= datetime('now', '-1 day')
          ORDER BY timestamp ASC`
        : `SELECT 
            strftime('%Y-%m-%d %H:%M', timestamp) as time,
            ROUND(AVG(price), 9) as price,
            AVG(network_activity) as network_activity,
            ROUND(AVG(predicted_low), 9) as predicted_low
          FROM gas_prices 
          WHERE timestamp >= datetime('now', '-7 day')
          GROUP BY strftime('%Y-%m-%d %H', timestamp)
          ORDER BY timestamp ASC`;

      const result = await db.execute({
        sql: query,
        args: []
      });

      const formattedData = result.rows.map(row => ({
        time: row.time as string,
        price: parseFloat(Number(row.price).toFixed(9)),
        networkActivity: Number(row.network_activity),
        predictedLow: parseFloat(Number(row.predicted_low).toFixed(9))
      }));

      setGasData(formattedData);
    } catch (error) {
      console.error('Error loading historical gas data:', error);
    }
  };

  // Guardar nuevos datos cuando se reciban
  useEffect(() => {
    if (!isLoading && gasPrice) {
      const currentPrice = formatGasPrice(gasPrice);
      
      // Verificar alertas
      alertService.checkAlerts(currentPrice).catch(error => {
        console.error('Error checking alerts:', error);
      });

      loadHistoricalData();
    }
  }, [gasPrice, isLoading]);

  // Cargar datos históricos al montar el componente y cuando cambie el timeRange
  useEffect(() => {
    loadHistoricalData();
  }, [timeRange]);

  return {
    currentGwei: formatGasPrice(gasPrice),
    predictedLow: gasPrice ? parseFloat((formatGasPrice(gasPrice) * 0.85).toFixed(9)) : 0,
    gasData,
    networkActivity: gasPrice ? Math.min(100, Math.floor(formatGasPrice(gasPrice) / 2)) : 0,
    setTimeRange,
    timeRange
  };
};