import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const db = createClient({
  url: process.env.VITE_TURSO_URL as string,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN as string,
});

async function initAlertsTables() {
  try {
    console.log('Creando tablas de alertas...');

    // Crear tabla de alertas
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS gas_alerts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
        name TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        threshold REAL NOT NULL,
        type TEXT CHECK(type IN ('below', 'above')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_triggered DATETIME
      )`,
      args: []
    });

    // Crear tabla de notificaciones
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS alert_notifications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
        alert_id TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        read INTEGER DEFAULT 0,
        FOREIGN KEY (alert_id) REFERENCES gas_alerts(id)
      )`,
      args: []
    });

    // Crear algunos datos de ejemplo
    await db.execute({
      sql: `INSERT INTO gas_alerts (name, threshold, type) 
            VALUES 
            ('Precio bajo', 20, 'below'),
            ('Precio alto', 100, 'above')
            ON CONFLICT DO NOTHING`,
      args: []
    });

    console.log('✅ Tablas de alertas creadas correctamente');
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  } finally {
    process.exit(0);
  }
}

initAlertsTables();
