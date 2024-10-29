export interface GasAlert {
  id: string;
  name: string;
  enabled: boolean;
  threshold: number;
  type: 'below' | 'above';
  createdAt: Date;
  lastTriggered?: Date;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
