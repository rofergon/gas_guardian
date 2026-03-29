import { createClient } from '@libsql/client';

let client;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDbClient() {
  if (client) {
    return client;
  }

  client = createClient({
    url: requireEnv('TURSO_URL'),
    authToken: requireEnv('TURSO_AUTH_TOKEN'),
  });

  return client;
}
