import http from 'node:http';
import { URL } from 'node:url';
import dotenv from 'dotenv';
import { handler as blockDataHandler } from '../netlify/functions/block-data.js';
import { handler as whalesHandler } from '../netlify/functions/whales.js';
import { handler as alertsHandler } from '../netlify/functions/alerts.js';

dotenv.config();

type Handler = (event: {
  httpMethod: string;
  queryStringParameters: Record<string, string>;
  body: string | null;
  headers: Record<string, string | string[] | undefined>;
  rawUrl: string;
  path: string;
}) => Promise<{
  statusCode?: number;
  headers?: Record<string, string>;
  body?: string;
}>;

const handlers: Record<string, Handler> = {
  '/.netlify/functions/block-data': blockDataHandler,
  '/.netlify/functions/whales': whalesHandler,
  '/.netlify/functions/alerts': alertsHandler,
};

function setCorsHeaders(response: http.ServerResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(request: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    request.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    request.on('error', reject);
  });
}

async function main() {
  const host = process.env.DEV_API_HOST || '127.0.0.1';
  const port = Number(process.env.DEV_API_PORT || '8788');

  const server = http.createServer(async (request, response) => {
    setCorsHeaders(response);

    if (!request.url) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Missing URL' }));
      return;
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    const requestUrl = new URL(request.url, `http://${host}:${port}`);

    if (requestUrl.pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    const handler = handlers[requestUrl.pathname];
    if (!handler) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    try {
      const rawBody = await readBody(request);
      const result = await handler({
        httpMethod: request.method || 'GET',
        queryStringParameters: Object.fromEntries(requestUrl.searchParams.entries()),
        body: rawBody || null,
        headers: request.headers,
        rawUrl: requestUrl.toString(),
        path: requestUrl.pathname,
      });

      const statusCode = result.statusCode || 200;
      const headers = result.headers || { 'Content-Type': 'application/json' };

      Object.entries(headers).forEach(([key, value]) => {
        response.setHeader(key, value);
      });

      response.writeHead(statusCode);
      response.end(result.body || '');
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
        })
      );
    }
  });

  server.listen(port, host, () => {
    console.log(`Local API server running at http://${host}:${port}`);
    console.log(`Health check: http://${host}:${port}/health`);
  });
}

main().catch((error) => {
  console.error('Failed to start local API server:', error);
  process.exit(1);
});
