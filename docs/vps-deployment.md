# VPS Deployment

## Why a VPS

The ingestion worker needs to poll Ethereum continuously and maintain progress between runs. A small VPS is the simplest reliable setup for that.

Good low-cost options are any Linux VPS with:

- 1 vCPU
- 1 GB RAM
- Node.js 20+

## Initial setup

```bash
sudo apt update
sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Clone the project, install dependencies, and create `.env`.

```bash
git clone <your-repo-url>
cd gas_guardian
npm install
npm run init-db
```

The worker and the API layer are separate concerns:

- the worker is the long-running process that ingests blocks
- the API layer serves chart, whale, and alert data to the frontend

In this repo, the API layer is implemented as serverless endpoints under `netlify/functions`. If you self-host everything on a VPS later, keep the same rule: Turso secrets stay server-side and the browser only talks to your API.

For local development before using a VPS:

- run `npm run dev:api` to simulate the backend locally
- run `npm run dev` for the frontend
- or run `npm run dev:local` to start both together

## Option 1: pm2

Install pm2 globally:

```bash
sudo npm install -g pm2
```

Start the worker:

```bash
pm2 start npm --name gasguardian-worker -- run worker
pm2 save
pm2 startup
```

Useful commands:

```bash
pm2 logs gasguardian-worker
pm2 restart gasguardian-worker
pm2 status
```

## Option 2: systemd

Create `/etc/systemd/system/gasguardian-worker.service`:

```ini
[Unit]
Description=GasGuardian ingestion worker
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/gas_guardian
ExecStart=/usr/bin/npm run worker
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gasguardian-worker
sudo systemctl start gasguardian-worker
```

Useful commands:

```bash
sudo systemctl status gasguardian-worker
sudo journalctl -u gasguardian-worker -f
sudo systemctl restart gasguardian-worker
```

## Operational notes

- Keep at least two public RPC URLs in `RPC_URLS`.
- Start with a recent `START_BLOCK` if you do not need a full historical backfill.
- Watch for `429` or timeout spikes in logs.
- Turso can remain hosted remotely; the VPS only needs to run the worker.
