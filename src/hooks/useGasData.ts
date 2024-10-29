import { useState, useEffect } from 'react';
import { GasData } from '../types';

export const useGasData = () => {
  const [currentGwei, setCurrentGwei] = useState(45);
  const [predictedLow, setPredictedLow] = useState(30);
  const [gasData, setGasData] = useState<GasData[]>([]);
  const [networkActivity, setNetworkActivity] = useState(69);

  useEffect(() => {
    const generateInitialData = (): GasData[] => {
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: Math.floor(Math.random() * (100 - 20) + 20)
      }));
    };

    setGasData(generateInitialData());

    const interval = setInterval(() => {
      const newPrice = Math.floor(Math.random() * (100 - 20) + 20);
      const newActivity = Math.floor(Math.random() * (100 - 30) + 30);
      
      setCurrentGwei(newPrice);
      setPredictedLow(Math.floor(newPrice * 0.7));
      setNetworkActivity(newActivity);
      
      setGasData(prev => [
        ...prev.slice(1),
        { time: new Date().toLocaleTimeString(), price: newPrice }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { currentGwei, predictedLow, gasData, networkActivity };
};