# GasGuardian

GasGuardian is an Ethereum gas dashboard that stores block analytics and whale-transfer data in Turso and serves them through a backend API layer.

The old version depended on QuickNode Streams + Functions for ingestion. This version replaces that pipeline with:

- public Ethereum RPC endpoints
- a self-hosted Node.js worker
- Turso as the read model for the UI

## Architecture

- Frontend:
  - reads chart and whale data from backend endpoints
  - uses `VITE_RPC_HTTP_URL` for direct contract reads and gas estimation
- API layer:
  - exposes `/.netlify/functions/block-data`
  - exposes `/.netlify/functions/whales`
  - exposes `/.netlify/functions/alerts`
  - reads Turso using server-side secrets only
- Worker:
  - polls `eth_blockNumber`
  - fetches blocks with `eth_getBlockByNumber(blockNumber, true)`
  - computes the same metrics the QuickNode scripts used to derive
  - upserts `block_data`, `transactions`, and `ingestion_state`
- Database:
  - `block_data` stores derived per-block analytics
  - `transactions` stores filtered whale transfers
  - `ingestion_state` stores the last processed block

## Environment

Copy the values from `.envexample` into `.env` and fill in your real credentials.

Required values:

- `VITE_RPC_HTTP_URL`: primary RPC used by the frontend
- `VITE_API_BASE_URL`: optional custom API base URL
- `RPC_URLS`: comma-separated public RPC URLs for the worker
- `TURSO_URL`: Turso/libsql URL for Node scripts
- `TURSO_AUTH_TOKEN`: Turso auth token for Node scripts
- `START_BLOCK`: first block to process when the database is empty

Optional tuning:

- `WHALE_MIN_ETH`: defaults to `0.5`
- `POLL_INTERVAL_MS`: defaults to `12000`
- `CATCHUP_DELAY_MS`: defaults to `350`

## Local Setup

Install dependencies:

```bash
npm install
```

Initialize the schema:

```bash
npm run init-db
```

Validate the block parser against the included fixture:

```bash
npm run validate-fixture
```

Run the ingestion worker:

```bash
npm run worker
```

Run the frontend:

```bash
npm run dev
```

Run the local API simulator:

```bash
npm run dev:api
```

Run frontend + local API together:

```bash
npm run dev:local
```

In development, the frontend defaults to `http://127.0.0.1:8788/.netlify/functions`, so you do not need to expose Turso credentials to the browser.

## Worker behavior

The worker is resumable and idempotent:

- it stores the latest processed block in `ingestion_state`
- it upserts `block_data` by `block_number`
- it upserts `transactions` by `tx_hash`
- it retries and rotates across multiple public RPC URLs

Because it uses public RPC instead of a paid streaming product, backfills will be slower and rate-limit handling matters more.

## VPS deployment

For continuous ingestion, run the worker on a small VPS 24/7. This is the recommended production shape.

Recommended responsibilities for the VPS:

- run the worker continuously
- restart it automatically if it crashes
- keep logs
- keep `.env` values private

Examples for `pm2` and `systemd` are in [docs/vps-deployment.md](/c:/Users/sebas/Documents/GasGuardian/gas_guardian/docs/vps-deployment.md).

## Notes

- Subgraph queries can still be added later for specialized contract/event views.
- They are not the main replacement for this app because the dashboard depends on chain-wide block analytics and filtered native ETH transfers.
