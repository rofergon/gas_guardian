import { createClient } from '@libsql/client';

export const db = createClient({
  url: import.meta.env.VITE_TURSO_URL as string,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN as string,
});
