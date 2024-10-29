import { db } from '../lib/db';
import { GasAlert, AlertNotification } from '../types/Alert';

export const alertService = {
  async createAlert(alert: Omit<GasAlert, 'id' | 'createdAt'>) {
    const result = await db.execute({
      sql: `INSERT INTO gas_alerts (name, threshold, type, enabled)
            VALUES (?, ?, ?, ?)
            RETURNING id`,
      args: [alert.name, alert.threshold, alert.type, alert.enabled ? 1 : 0]
    });
    
    return result.rows[0].id as string;
  },

  async getAlerts(): Promise<GasAlert[]> {
    const result = await db.execute({
      sql: `SELECT * FROM gas_alerts ORDER BY created_at DESC`,
      args: []
    });

    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      enabled: Boolean(row.enabled),
      threshold: Number(row.threshold),
      type: row.type as 'below' | 'above',
      createdAt: new Date(row.created_at as string),
      lastTriggered: row.last_triggered ? new Date(row.last_triggered as string) : undefined
    }));
  },

  async toggleAlert(id: string, enabled: boolean) {
    await db.execute({
      sql: `UPDATE gas_alerts SET enabled = ? WHERE id = ?`,
      args: [enabled ? 1 : 0, id]
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
        
        await db.execute({
          sql: `UPDATE gas_alerts SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?`,
          args: [alert.id]
        });
      }
    }

    return triggeredAlerts;
  },

  async createNotification(notification: Omit<AlertNotification, 'id'>): Promise<AlertNotification> {
    const result = await db.execute({
      sql: `INSERT INTO alert_notifications (alert_id, message, timestamp, read)
            VALUES (?, ?, ?, ?)
            RETURNING id`,
      args: [
        notification.alertId,
        notification.message,
        notification.timestamp.toISOString(),
        notification.read ? 1 : 0
      ]
    });

    return {
      id: result.rows[0].id as string,
      ...notification
    };
  },

  async deleteAlert(id: string) {
    await db.execute({
      sql: `DELETE FROM gas_alerts WHERE id = ?`,
      args: [id]
    });
  }
};
