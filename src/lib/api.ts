const defaultBasePath = '/.netlify/functions';

function getApiBaseUrl(): string {
  const customBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (customBaseUrl) {
    return customBaseUrl;
  }

  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8788/.netlify/functions';
  }

  return defaultBasePath;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || `API request failed with status ${response.status}`);
  }

  return payload;
}
