import { apiRequest } from '../lib/api';
import { GasAlert, AlertNotification } from '../types/Alert';

export const alertService = {
  async createAlert(alert: Omit<GasAlert, 'id' | 'createdAt'>) {
    const response = await apiRequest<{
      alert: Omit<GasAlert, 'createdAt' | 'lastTriggered'> & {
        createdAt: string;
        lastTriggered?: string;
      };
    }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });

    return response.alert.id;
  },

  async getAlerts(): Promise<GasAlert[]> {
    const response = await apiRequest<{
      alerts: Array<Omit<GasAlert, 'createdAt' | 'lastTriggered'> & {
        createdAt: string;
        lastTriggered?: string;
      }>;
    }>('/alerts');

    return response.alerts.map((alert) => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined,
    }));
  },

  async toggleAlert(id: string, enabled: boolean) {
    await apiRequest<{ success: boolean }>('/alerts', {
      method: 'PATCH',
      body: JSON.stringify({ id, enabled }),
    });
  },

  async checkAlerts(currentGasPrice: number) {
    const alerts = await this.getAlerts();
    const triggeredAlerts: AlertNotification[] = [];

    for (const alert of alerts) {
      if (!alert.enabled) continue;

      const shouldTrigger = alert.type === 'below' 
        ? currentGasPrice <= alert.threshold
        : currentGasPrice >= alert.threshold;

      if (shouldTrigger) {
        const notification = await this.createNotification({
          alertId: alert.id,
          message: `Gas price is ${alert.type === 'below' ? 'below' : 'above'} ${alert.threshold} Gwei`,
          timestamp: new Date(),
          read: false
        });
        
        triggeredAlerts.push(notification);
      }
    }

    return triggeredAlerts;
  },

  async createNotification(notification: Omit<AlertNotification, 'id'>): Promise<AlertNotification> {
    return {
      id: crypto.randomUUID(),
      ...notification
    };
  },

  async deleteAlert(id: string) {
    await apiRequest<{ success: boolean }>('/alerts', { method: 'DELETE' }, { id });
  }
};
