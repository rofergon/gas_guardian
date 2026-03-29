import { getDbClient } from './lib/db';
import { getNumberEnv, getRpcUrls, requireEnv } from './lib/env';
import {
  analyzeBlock,
  extractWhaleTransactions,
  type BlockAnalysis,
  type RpcBlock,
  type WhaleTransactionRecord,
} from './lib/blockProcessing';

type JsonRpcResult<T> = {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

class RpcPool {
  private index = 0;

  constructor(private readonly urls: string[]) {}

  async call<T>(method: string, params: unknown[]): Promise<T> {
    let attempts = 0;
    let lastError: unknown;

    while (attempts < this.urls.length * 3) {
      const url = this.urls[this.index];
      this.index = (this.index + 1) % this.urls.length;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params,
          }),
        });

        if (response.status === 429) {
          await sleep(1500 * (attempts + 1));
          attempts += 1;
          continue;
        }

        if (!response.ok) {
          throw new Error(`RPC ${response.status} from ${url}`);
        }

        const payload = (await response.json()) as JsonRpcResult<T>;
        if (payload.error) {
          throw new Error(`RPC error ${payload.error.code}: ${payload.error.message}`);
        }

        if (payload.result === undefined) {
          throw new Error(`RPC returned no result for ${method}`);
        }

        return payload.result;
      } catch (error) {
        lastError = error;
        attempts += 1;
        await sleep(Math.min(1000 * attempts, 5000));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('RPC request failed');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toHexBlock(blockNumber: number): string {
  return `0x${blockNumber.toString(16)}`;
}

async function getLastProcessedBlock(startBlock: number): Promise<number> {
  const db = getDbClient();
  const state = await db.execute({
    sql: 'SELECT value FROM ingestion_state WHERE key = ?',
    args: ['last_processed_block'],
  });

  const storedValue = state.rows[0]?.value;
  if (storedValue !== undefined && storedValue !== null && String(storedValue).trim() !== '') {
    return Number(storedValue);
  }

  const existingMax = await db.execute('SELECT MAX(block_number) AS maxBlock FROM block_data');
  const maxBlock = existingMax.rows[0]?.maxBlock;
  if (maxBlock !== undefined && maxBlock !== null) {
    return Number(maxBlock);
  }

  return startBlock - 1;
}

async function setLastProcessedBlock(blockNumber: number): Promise<void> {
  const db = getDbClient();
  await db.execute({
    sql: `
      INSERT INTO ingestion_state (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: ['last_processed_block', String(blockNumber)],
  });
}

async function upsertBlockData(analysis: BlockAnalysis): Promise<void> {
  const db = getDbClient();
  await db.execute({
    sql: `
      INSERT INTO block_data (
        block_number,
        block_hash,
        timestamp,
        base_fee_gwei,
        gas_limit,
        gas_used,
        utilization_percent,
        network_congestion,
        network_trend,
        avg_gas_price,
        median_gas_price,
        avg_priority_fee,
        median_priority_fee,
        total_transactions,
        eip1559_transactions,
        legacy_transactions,
        total_value_transferred
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(block_number) DO UPDATE SET
        block_hash = excluded.block_hash,
        timestamp = excluded.timestamp,
        base_fee_gwei = excluded.base_fee_gwei,
        gas_limit = excluded.gas_limit,
        gas_used = excluded.gas_used,
        utilization_percent = excluded.utilization_percent,
        network_congestion = excluded.network_congestion,
        network_trend = excluded.network_trend,
        avg_gas_price = excluded.avg_gas_price,
        median_gas_price = excluded.median_gas_price,
        avg_priority_fee = excluded.avg_priority_fee,
        median_priority_fee = excluded.median_priority_fee,
        total_transactions = excluded.total_transactions,
        eip1559_transactions = excluded.eip1559_transactions,
        legacy_transactions = excluded.legacy_transactions,
        total_value_transferred = excluded.total_value_transferred
    `,
    args: [
      analysis.block_number,
      analysis.block_hash,
      analysis.timestamp,
      analysis.base_fee_gwei,
      analysis.gas_limit,
      analysis.gas_used,
      analysis.utilization_percent,
      analysis.network_congestion,
      analysis.network_trend,
      analysis.avg_gas_price,
      analysis.median_gas_price,
      analysis.avg_priority_fee,
      analysis.median_priority_fee,
      analysis.total_transactions,
      analysis.eip1559_transactions,
      analysis.legacy_transactions,
      analysis.total_value_transferred,
    ],
  });
}

async function upsertWhaleTransactions(transactions: WhaleTransactionRecord[]): Promise<void> {
  if (!transactions.length) {
    return;
  }

  const db = getDbClient();
  for (const tx of transactions) {
    await db.execute({
      sql: `
        INSERT INTO transactions (
          block_number,
          network,
          tx_hash,
          from_address,
          to_address,
          value,
          units,
          method_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tx_hash) DO UPDATE SET
          block_number = excluded.block_number,
          network = excluded.network,
          from_address = excluded.from_address,
          to_address = excluded.to_address,
          value = excluded.value,
          units = excluded.units,
          method_id = excluded.method_id
      `,
      args: [
        tx.block_number,
        tx.network,
        tx.tx_hash,
        tx.from_address,
        tx.to_address,
        tx.value,
        tx.units,
        tx.method_id,
      ],
    });
  }
}

async function processBlock(
  rpc: RpcPool,
  blockNumber: number,
  network: string,
  minWhaleEth: number
): Promise<void> {
  const block = await rpc.call<RpcBlock>('eth_getBlockByNumber', [toHexBlock(blockNumber), true]);

  if (!block) {
    throw new Error(`Block ${blockNumber} was not returned by RPC`);
  }

  const analysis = analyzeBlock(block);
  const whales = extractWhaleTransactions(block, network, minWhaleEth);

  await upsertBlockData(analysis);
  await upsertWhaleTransactions(whales);
  await setLastProcessedBlock(blockNumber);

  console.log(
    `Processed block ${blockNumber}: ${analysis.total_transactions} txs, ${whales.length} whale txs`
  );
}

async function main() {
  requireEnv('TURSO_URL');
  requireEnv('TURSO_AUTH_TOKEN');

  const rpc = new RpcPool(getRpcUrls());
  const startBlock = getNumberEnv('START_BLOCK', 0);
  const maxBlocks = getNumberEnv('MAX_BLOCKS', 0);
  const whaleMinEth = getNumberEnv('WHALE_MIN_ETH', 0.5);
  const pollIntervalMs = getNumberEnv('POLL_INTERVAL_MS', 12_000);
  const catchupDelayMs = getNumberEnv('CATCHUP_DELAY_MS', 350);
  const network = process.env.NETWORK?.trim() || 'ethereum-mainnet';
  let processedThisRun = 0;

  if (startBlock <= 0) {
    throw new Error('START_BLOCK must be set to a positive block number');
  }

  let lastProcessedBlock = await getLastProcessedBlock(startBlock);
  console.log(`Starting ingestion from block ${lastProcessedBlock + 1}`);

  while (true) {
    try {
      const latestBlockHex = await rpc.call<string>('eth_blockNumber', []);
      const latestBlock = Number(BigInt(latestBlockHex));

      if (lastProcessedBlock >= latestBlock) {
        await sleep(pollIntervalMs);
        continue;
      }

      const nextBlock = lastProcessedBlock + 1;
      await processBlock(rpc, nextBlock, network, whaleMinEth);
      lastProcessedBlock = nextBlock;
      processedThisRun += 1;

      if (maxBlocks > 0 && processedThisRun >= maxBlocks) {
        console.log(`Reached MAX_BLOCKS=${maxBlocks}. Exiting cleanly.`);
        return;
      }

      if (lastProcessedBlock < latestBlock) {
        await sleep(catchupDelayMs);
      }
    } catch (error) {
      console.error('Ingestion loop failed, retrying after backoff:', error);
      await sleep(Math.max(pollIntervalMs, 5000));
    }
  }
}

main().catch((error) => {
  console.error('Fatal ingestion error:', error);
  process.exit(1);
});
