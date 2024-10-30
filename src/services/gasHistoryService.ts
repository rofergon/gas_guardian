import { createClient } from '@libsql/client';

const client = createClient({
  url: import.meta.env.VITE_TURSO_URL as string,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN as string,
});

interface GasHistoryRecord {
  timestamp: string;
  block_number: number;
  total_gas_used: number;
}

export const gasHistoryService = {
  async saveGasData(blockNumber: number, totalGasUsed: number) {
    try {
      await client.execute({
        sql: `INSERT INTO gas_history (block_number, total_gas_used) VALUES (?, ?)`,
        args: [blockNumber, totalGasUsed]
      });
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving gas data:', error);
      throw error;
    }
  },

  async getLastHourData(): Promise<GasHistoryRecord[]> {
    try {
      const result = await client.execute({
        sql: `SELECT timestamp, block_number, total_gas_used 
              FROM gas_history 
              WHERE timestamp >= datetime('now', '-1 hour')
              ORDER BY timestamp ASC`,
        args: []
      });
      
      if (!result.rows) {
        return [];
      }

      return result.rows.map(row => ({
        timestamp: row.timestamp as string,
        block_number: row.block_number as number,
        total_gas_used: row.total_gas_used as number
      }));
    } catch (error) {
      console.error('Error fetching gas history:', error);
      return [];
    }
  }
};