# Database Schema

## Why the app needs this schema

The current app does not read raw Ethereum blocks directly in the UI. Instead, it reads a prepared SQL model.

From the codebase:

- [useBlockDataChart.ts](/c:/Users/sebas/Documents/GasGuardian/gas_guardian/src/hooks/useBlockDataChart.ts) expects a `block_data` table with per-block gas analytics.
- [useWhalesData.ts](/c:/Users/sebas/Documents/GasGuardian/gas_guardian/src/hooks/useWhalesData.ts) expects a `transactions` table with filtered whale transfers.
- The ingestion worker needs `ingestion_state` to resume safely after restarts.
- The alert service expects `gas_alerts` and `alert_notifications`.

## Required tables

### `block_data`

Stores one derived row per processed block.

Main fields:

- `block_number`: unique block id
- `block_hash`
- `timestamp`
- `base_fee_gwei`
- `gas_limit`
- `gas_used`
- `utilization_percent`
- `network_congestion`
- `network_trend`
- `avg_gas_price`
- `median_gas_price`
- `avg_priority_fee`
- `median_priority_fee`
- `total_transactions`
- `eip1559_transactions`
- `legacy_transactions`
- `total_value_transferred`

Reason:

- this is exactly the shape the dashboard and AI layer consume
- it avoids recomputing block analytics in the browser

### `transactions`

Stores the subset of transfers considered whale activity.

Main fields:

- `tx_hash`: unique idempotency key
- `block_number`
- `network`
- `from_address`
- `to_address`
- `value`
- `units`
- `method_id`
- `created_at`

Reason:

- the whales leaderboard groups by `from_address`
- the worker can re-run safely because `tx_hash` is unique

### `ingestion_state`

Stores worker progress.

Main fields:

- `key`
- `value`
- `updated_at`

Current usage:

- `last_processed_block`

Reason:

- allows catch-up after restart
- prevents reindexing everything from scratch

### `gas_alerts`

Stores configured gas alerts.

Main fields:

- `id`
- `name`
- `threshold`
- `type`
- `enabled`
- `created_at`
- `last_triggered`

### `alert_notifications`

Stores generated alert notifications.

Main fields:

- `id`
- `alert_id`
- `message`
- `timestamp`
- `read`

## Constraints and indexes

Important constraints:

- `block_data.block_number` must be unique
- `transactions.tx_hash` must be unique
- `gas_alerts.type` is constrained to `below` or `above`

Important indexes:

- `block_data(timestamp)` for time-range chart queries
- `transactions(from_address)` for leaderboard grouping
- `transactions(block_number)` for block-level lookup
- `transactions(value)` for whale-threshold filtering

## Secrets model

The current best-practice setup is:

- the worker reads and writes Turso using `TURSO_URL` and `TURSO_AUTH_TOKEN`
- the backend API reads Turso using the same server-side secrets
- the frontend never receives Turso credentials

The browser now talks to backend endpoints instead of talking to Turso directly.
