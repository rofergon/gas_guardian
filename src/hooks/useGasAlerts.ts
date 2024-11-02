import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BlockChartData } from './useBlockDataChart';

interface Alert {
  id: string;
  name: string;
  threshold: number;
  isActive: boolean;
}

export const useGasAlerts = (alerts: Alert[], chartData: BlockChartData[]) => {
  const [lastCheckedValues, setLastCheckedValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!chartData.length) return;

    const currentBaseFee = chartData[chartData.length - 1].price;
    const activeAlerts = alerts.filter(alert => alert.isActive);

    activeAlerts.forEach(alert => {
      const wasTriggered = lastCheckedValues[alert.id];
      const shouldTrigger = currentBaseFee >= alert.threshold;

      if (shouldTrigger) {
        toast.error(
          `🚨 Gas Alert: ${alert.name} - Base fee (${currentBaseFee.toFixed(2)} Gwei) is above threshold (${alert.threshold} Gwei)`,
          {
            id: `gas-alert-${alert.id}`,
            duration: 5000,
            position: 'top-right',
          }
        );

        if (!wasTriggered) {
          setLastCheckedValues(prev => ({
            ...prev,
            [alert.id]: true
          }));
        }
      } else {
        if (wasTriggered) {
          setLastCheckedValues(prev => ({
            ...prev,
            [alert.id]: false
          }));
          
          toast.success(
            `✅ Gas Normal: ${alert.name} - Base fee (${currentBaseFee.toFixed(2)} Gwei) has returned to normal levels`,
            {
              id: `gas-normal-${alert.id}`,
              duration: 5000,
              position: 'top-right',
            }
          );
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, chartData]);

  return {
    lastCheckedValues,
    currentBaseFee: chartData.length ? chartData[chartData.length - 1].price : null
  };
};