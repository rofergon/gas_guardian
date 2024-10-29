import { useState, useEffect } from 'react';
import { GasAlert } from '../types/Alert';
import { alertService } from '../services/alertService';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<GasAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const fetchedAlerts = await alertService.getAlerts();
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const createAlert = async (alert: Omit<GasAlert, 'id' | 'createdAt'>) => {
    try {
      await alertService.createAlert(alert);
      await loadAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await alertService.deleteAlert(id);
      await loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const toggleAlert = async (id: string, enabled: boolean) => {
    try {
      await alertService.toggleAlert(id, enabled);
      await loadAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  useEffect(() => {
    loadAlerts().finally(() => setLoading(false));
  }, []);

  return {
    alerts,
    loading,
    createAlert,
    deleteAlert,
    toggleAlert,
    reloadAlerts: loadAlerts
  };
};
