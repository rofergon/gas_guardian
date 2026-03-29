import { getDbClient } from './lib/db';

async function main() {
  const db = getDbClient();
  const result = await db.execute(`
    DELETE FROM block_data
    WHERE base_fee_gwei < 0
      OR gas_limit < 0
      OR gas_used < 0
      OR utilization_percent < 0
      OR total_transactions < 0
  `);

  console.log(`Deleted ${result.rowsAffected ?? 0} invalid block_data rows.`);
}

main().catch((error) => {
  console.error('Failed to delete invalid gas data:', error);
  process.exit(1);
});
