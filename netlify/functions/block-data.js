import { getDbClient } from './_lib/db.js';
import { badRequest, ok, serverError } from './_lib/response.js';

const TIME_OFFSETS = {
  '2h': '-2 hours',
  '4h': '-4 hours',
  '8h': '-8 hours',
  '24h': '-24 hours',
  '1w': '-7 days',
};

export const handler = async (event) => {
  try {
    const range = event.queryStringParameters?.range || '24h';
    const timeOffset = TIME_OFFSETS[range];

    if (!timeOffset) {
      return badRequest(`Unsupported range: ${range}`);
    }

    const db = getDbClient();
    const result = await db.execute({
      sql: `
        SELECT
          block_number,
          timestamp AS time,
          base_fee_gwei AS price,
          base_fee_gwei * 0.85 AS predicted_low,
          utilization_percent AS network_activity,
          gas_used,
          utilization_percent,
          total_transactions,
          eip1559_transactions,
          legacy_transactions,
          total_value_transferred,
          network_congestion,
          network_trend,
          avg_gas_price,
          median_gas_price,
          avg_priority_fee,
          median_priority_fee
        FROM block_data
        WHERE timestamp >= datetime('now', ?)
        ORDER BY timestamp DESC
      `,
      args: [timeOffset],
    });

    return ok({
      data: result.rows.map((row) => ({
        time: row.time,
        blockNumber: Number(row.block_number),
        price: Number(row.price),
        predictedLow: Number(row.predicted_low),
        networkActivity: Number(row.network_activity),
        gasUsed: Number(row.gas_used),
        utilizationPercent: Number(row.utilization_percent),
        totalTransactions: Number(row.total_transactions),
        eip1559Transactions: Number(row.eip1559_transactions),
        legacyTransactions: Number(row.legacy_transactions),
        totalValueTransferred: Number(row.total_value_transferred),
        networkCongestion: row.network_congestion,
        networkTrend: row.network_trend,
        avgGasPrice: Number(row.avg_gas_price),
        medianGasPrice: Number(row.median_gas_price),
        avgPriorityFee: Number(row.avg_priority_fee),
        medianPriorityFee: Number(row.median_priority_fee),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
};
