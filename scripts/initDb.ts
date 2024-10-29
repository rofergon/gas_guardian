import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Carga las variables de entorno
dotenv.config();

const db = createClient({
  url: process.env.VITE_TURSO_URL as string,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN as string,
});

async function initDB() {
  try {
    console.log('Recreando tabla...');

    // Primero eliminamos la tabla existente
    await db.execute({
      sql: `DROP TABLE IF EXISTS gas_prices`,
      args: []
    });

    // Creamos la tabla con el tipo REAL para manejar decimales
    await db.execute({
      sql: `
        CREATE TABLE gas_prices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          price REAL NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          network_activity INTEGER,
          predicted_low REAL
        )
      `,
      args: []
    });

    await db.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_timestamp ON gas_prices(timestamp)`,
      args: []
    });

    console.log('Tabla recreada correctamente');
  } catch (error) {
    console.error('Error recreando la tabla:', error);
  } finally {
    process.exit(0);
  }
}

initDB();
