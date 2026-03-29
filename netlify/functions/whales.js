import { getDbClient } from './_lib/db.js';
import { badRequest, ok, serverError } from './_lib/response.js';

export const handler = async (event) => {
  try {
    const page = Number(event.queryStringParameters?.page || '1');
    const pageSize = Number(event.queryStringParameters?.pageSize || '10');

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      return badRequest('page and pageSize must be positive integers');
    }

    const offset = (page - 1) * pageSize;
    const db = getDbClient();

    const countResult = await db.execute(`
      SELECT COUNT(DISTINCT from_address) AS total
      FROM transactions
      WHERE value > 0.5
    `);

    const result = await db.execute({
      sql: `
        SELECT
          from_address AS address,
          COUNT(DISTINCT block_number) AS totalBlocks,
          COUNT(*) AS totalTransactions,
          SUM(value) AS totalValueETH,
          MAX(datetime(created_at)) AS lastSeen
        FROM transactions
        WHERE value > 0.5
        GROUP BY from_address
        ORDER BY totalValueETH DESC
        LIMIT ? OFFSET ?
      `,
      args: [pageSize, offset],
    });

    return ok({
      totalCount: Number(countResult.rows[0]?.total || 0),
      whales: result.rows.map((row) => ({
        address: String(row.address),
        totalBlocks: Number(row.totalBlocks),
        totalTransactions: Number(row.totalTransactions),
        totalValueETH: Number(row.totalValueETH),
        lastSeen: String(row.lastSeen),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
};
