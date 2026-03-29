CREATE TABLE IF NOT EXISTS block_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_number INTEGER NOT NULL UNIQUE,
  block_hash TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  base_fee_gwei REAL NOT NULL,
  gas_limit INTEGER NOT NULL,
  gas_used INTEGER NOT NULL,
  utilization_percent REAL NOT NULL,
  network_congestion TEXT NOT NULL,
  network_trend TEXT NOT NULL,
  avg_gas_price REAL NOT NULL,
  median_gas_price REAL NOT NULL,
  avg_priority_fee REAL NOT NULL DEFAULT 0,
  median_priority_fee REAL NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL,
  eip1559_transactions INTEGER NOT NULL,
  legacy_transactions INTEGER NOT NULL,
  total_value_transferred REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_number INTEGER NOT NULL,
  network TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value REAL NOT NULL,
  units TEXT NOT NULL DEFAULT 'eth',
  method_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingestion_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gas_alerts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  threshold REAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('below', 'above')),
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_triggered TEXT
);

CREATE TABLE IF NOT EXISTS alert_notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  alert_id TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (alert_id) REFERENCES gas_alerts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_block_data_timestamp ON block_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);
CREATE INDEX IF NOT EXISTS idx_transactions_value ON transactions(value);

INSERT INTO ingestion_state (key, value)
VALUES ('last_processed_block', '')
ON CONFLICT(key) DO NOTHING;
