export interface RpcTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  input?: string;
  type?: string;
}

export interface RpcBlock {
  number: string;
  hash: string;
  timestamp: string;
  baseFeePerGas?: string;
  gasLimit: string;
  gasUsed: string;
  blobGasUsed?: string;
  transactions: RpcTransaction[];
}

interface NumericStats {
  average: number;
  median: number;
}

export interface BlockAnalysis {
  block_number: number;
  block_hash: string;
  timestamp: string;
  base_fee_gwei: number;
  gas_limit: number;
  gas_used: number;
  utilization_percent: number;
  network_congestion: string;
  network_trend: string;
  avg_gas_price: number;
  median_gas_price: number;
  avg_priority_fee: number;
  median_priority_fee: number;
  total_transactions: number;
  eip1559_transactions: number;
  legacy_transactions: number;
  total_value_transferred: number;
}

export interface WhaleTransactionRecord {
  block_number: number;
  network: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  value: number;
  units: string;
  method_id: string | null;
}

function hexToBigInt(value?: string): bigint {
  if (!value) {
    return 0n;
  }
  return BigInt(value);
}

function hexToNumber(value?: string): number {
  return Number(hexToBigInt(value));
}

function weiToEth(value: bigint): number {
  return Number(value) / 1e18;
}

function weiToGwei(value: bigint): number {
  return Number(value) / 1e9;
}

function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

function calculateMedian(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

function calculateStats(values: number[]): NumericStats {
  if (!values.length) {
    return { average: 0, median: 0 };
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const median = calculateMedian(values);

  return {
    average: roundTo(average, 2),
    median: roundTo(median, 2),
  };
}

export function analyzeBlock(block: RpcBlock): BlockAnalysis {
  const blockNumber = hexToNumber(block.number);
  const timestamp = new Date(hexToNumber(block.timestamp) * 1000).toISOString();
  const baseFeeGwei = weiToGwei(hexToBigInt(block.baseFeePerGas));
  const gasLimit = hexToNumber(block.gasLimit);
  const gasUsed = hexToNumber(block.gasUsed);
  const utilization = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;

  const gasPrices: number[] = [];
  const priorityFees: number[] = [];
  let totalValueTransferred = 0;
  let eip1559Transactions = 0;
  let legacyTransactions = 0;

  for (const tx of block.transactions) {
    const txType = hexToNumber(tx.type ?? '0x0');
    if (txType === 2) {
      eip1559Transactions += 1;
    } else if (txType === 0 || txType === 1) {
      legacyTransactions += 1;
    }

    const gasPriceWei = hexToBigInt(tx.gasPrice ?? tx.maxFeePerGas ?? '0x0');
    gasPrices.push(weiToGwei(gasPriceWei));

    const priorityFeeWei = hexToBigInt(tx.maxPriorityFeePerGas ?? '0x0');
    priorityFees.push(weiToGwei(priorityFeeWei));

    totalValueTransferred += weiToEth(hexToBigInt(tx.value));
  }

  const gasPriceStats = calculateStats(gasPrices);
  const priorityFeeStats = calculateStats(priorityFees);

  return {
    block_number: blockNumber,
    block_hash: block.hash,
    timestamp,
    base_fee_gwei: roundTo(baseFeeGwei, 2),
    gas_limit: gasLimit,
    gas_used: gasUsed,
    utilization_percent: roundTo(utilization, 2),
    network_congestion:
      utilization > 80 ? 'high' : utilization > 50 ? 'medium' : 'low',
    network_trend:
      baseFeeGwei > 200 ? 'critical' : baseFeeGwei > 100 ? 'rising' : baseFeeGwei > 50 ? 'moderate' : 'stable',
    avg_gas_price: gasPriceStats.average,
    median_gas_price: gasPriceStats.median,
    avg_priority_fee: priorityFeeStats.average,
    median_priority_fee: priorityFeeStats.median,
    total_transactions: block.transactions.length,
    eip1559_transactions: eip1559Transactions,
    legacy_transactions: legacyTransactions,
    total_value_transferred: roundTo(totalValueTransferred, 4),
  };
}

export function extractWhaleTransactions(
  block: RpcBlock,
  network: string,
  minEth: number
): WhaleTransactionRecord[] {
  const minWei = BigInt(Math.floor(minEth * 1e18));
  const blockNumber = hexToNumber(block.number);

  return block.transactions
    .filter((tx) => tx.to && tx.from && hexToBigInt(tx.value) >= minWei)
    .map((tx) => ({
      block_number: blockNumber,
      network,
      tx_hash: tx.hash,
      from_address: tx.from,
      to_address: tx.to as string,
      value: roundTo(weiToEth(hexToBigInt(tx.value)), 8),
      units: 'eth',
      method_id: tx.input ? tx.input.slice(0, 10) : null,
    }));
}
