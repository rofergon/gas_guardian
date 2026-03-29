import { executeStatements } from './lib/db';

async function main() {
  await executeStatements([
    `
      CREATE TABLE IF NOT EXISTS gas_alerts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        threshold REAL NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('below', 'above')),
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_triggered TEXT
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS alert_notifications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        alert_id TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (alert_id) REFERENCES gas_alerts(id) ON DELETE CASCADE
      )
    `,
  ]);

  console.log('Alert tables are ready.');
}

main().catch((error) => {
  console.error('Failed to initialize alert tables:', error);
  process.exit(1);
});
