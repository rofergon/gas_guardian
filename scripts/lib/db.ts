import { createClient, type Client } from '@libsql/client';
import { requireEnv } from './env';

let sharedClient: Client | null = null;

export function getDbClient(): Client {
  if (sharedClient) {
    return sharedClient;
  }

  const url = requireEnv('TURSO_URL');
  const authToken = requireEnv('TURSO_AUTH_TOKEN');

  sharedClient = createClient({ url, authToken });
  return sharedClient;
}

export async function executeStatements(statements: string[]): Promise<void> {
  const client = getDbClient();
  for (const sql of statements) {
    await client.execute(sql);
  }
}
