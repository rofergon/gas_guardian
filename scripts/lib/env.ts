import dotenv from 'dotenv';

dotenv.config();

function readEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function getEnv(name: string, fallbackNames: string[] = []): string | undefined {
  const candidates = [name, ...fallbackNames];
  for (const candidate of candidates) {
    const value = readEnv(candidate);
    if (value) {
      return value;
    }
  }
  return undefined;
}

export function requireEnv(name: string, fallbackNames: string[] = []): string {
  const value = getEnv(name, fallbackNames);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getNumberEnv(
  name: string,
  defaultValue: number,
  fallbackNames: string[] = []
): number {
  const rawValue = getEnv(name, fallbackNames);
  if (!rawValue) {
    return defaultValue;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric environment variable: ${name}=${rawValue}`);
  }

  return parsed;
}

export function getRpcUrls(): string[] {
  const raw =
    getEnv('RPC_URLS') ??
    getEnv('VITE_RPC_HTTP_URL') ??
    getEnv('RPC_URL');

  if (!raw) {
    throw new Error('Missing RPC_URLS or VITE_RPC_HTTP_URL');
  }

  const urls = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!urls.length) {
    throw new Error('RPC_URLS did not contain any valid URLs');
  }

  return urls;
}
