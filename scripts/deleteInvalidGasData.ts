import * as dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Cargar variables de entorno
dotenv.config();

const db = createClient({
  url: process.env.VITE_TURSO_URL as string,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN as string,
});

async function deleteInvalidGasData() {
  try {
    await db.execute({
      sql: `DELETE FROM gas_prices 
            WHERE timestamp >= datetime('2024-01-24 16:44:00')
            AND timestamp <= datetime('2024-01-24 17:00:00')
            AND price = (
              SELECT price 
              FROM gas_prices 
              WHERE timestamp >= datetime('2024-01-24 16:44:00') 
              LIMIT 1
            )`,
      args: []
    });
    
    console.log('✅ Datos inválidos eliminados correctamente');
  } catch (error) {
    console.error('❌ Error al eliminar datos:', error);
  } finally {
    process.exit(0);
  }
}

deleteInvalidGasData();
