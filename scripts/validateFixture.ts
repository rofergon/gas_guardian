import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeBlock, extractWhaleTransactions, type RpcBlock } from './lib/blockProcessing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const fixturePath = path.resolve(__dirname, '..', 'ETHEREUM_MAINNET-BLOCK-21095834.json');
  const raw = await readFile(fixturePath, 'utf8');
  const block = JSON.parse(raw) as RpcBlock;

  const analysis = analyzeBlock(block);
  const whales = extractWhaleTransactions(block, 'ethereum-mainnet', 0.5);

  assert.equal(analysis.block_number, 21095834);
  assert.equal(analysis.block_hash, '0x4e98ec0e450ddb21c140af78baeb4435bb55e9e85a4e1523cf65f344e334e084');
  assert.equal(analysis.base_fee_gwei, 4.71);
  assert.equal(analysis.gas_limit, 30000000);
  assert.equal(analysis.gas_used, 9278470);
  assert.equal(analysis.utilization_percent, 30.93);
  assert.equal(analysis.total_transactions, 155);
  assert.equal(analysis.eip1559_transactions, 77);
  assert.equal(analysis.legacy_transactions, 77);
  assert.equal(analysis.avg_gas_price, 5.39);
  assert.equal(analysis.median_gas_price, 5);
  assert.equal(analysis.avg_priority_fee, 1.26);
  assert.equal(analysis.median_priority_fee, 0);
  assert.equal(analysis.total_value_transferred, 18.3368);
  assert.equal(whales.length, 6);

  console.log('Fixture validation passed.');
  console.log(JSON.stringify({ analysis, whaleCount: whales.length }, null, 2));
}

main().catch((error) => {
  console.error('Fixture validation failed:', error);
  process.exit(1);
});
