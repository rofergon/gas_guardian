import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeStatements } from './lib/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const schemaPath = path.resolve(__dirname, '..', 'db', 'schema.sql');
  const schema = await readFile(schemaPath, 'utf8');
  const statements = schema
    .split(/;\s*\r?\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => `${statement};`);

  await executeStatements(statements);

  console.log('Database schema is ready.');
}

main().catch((error) => {
  console.error('Failed to initialize database schema:', error);
  process.exit(1);
});
