import { db } from '../lib/db';
import { GasData } from '../types';

export const gasService = {
  async saveGasPrice(price: number, networkActivity: number, predictedLow: number) {
    await db.execute({
      sql: `INSERT INTO gas_prices (price, network_activity, predicted_low) 
            VALUES (?, ?, ?)`,
      args: [price, networkActivity, predictedLow]
    });
  },

  async getLastDayPrices(): Promise<GasData[]> {
    const result = await db.execute({
      sql: `SELECT 
              strftime('%H:%M', timestamp) as time,
              price,
              network_activity,
              predicted_low
            FROM gas_prices 
            WHERE timestamp >= datetime('now', '-1 day')
            ORDER BY timestamp ASC`
    });

    return result.rows.map(row => ({
      time: row.time as string,
      price: Number(row.price),
      networkActivity: Number(row.network_activity),
      predictedLow: Number(row.predicted_low)
    }));
  },

  async getLastWeekPrices(): Promise<GasData[]> {
    const result = await db.execute({
      sql: `SELECT 
              strftime('%Y-%m-%d %H:%M', timestamp) as time,
              AVG(price) as price,
              AVG(network_activity) as network_activity,
              AVG(predicted_low) as predicted_low
            FROM gas_prices 
            WHERE timestamp >= datetime('now', '-7 day')
            GROUP BY strftime('%Y-%m-%d %H', timestamp)
            ORDER BY timestamp ASC`
    });

    return result.rows.map(row => ({
      time: row.time as string,
      price: Number(row.price),
      networkActivity: Number(row.network_activity),
      predictedLow: Number(row.predicted_low)
    }));
  }
};
