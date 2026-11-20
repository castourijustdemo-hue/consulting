import { existsSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { loadEnvFile } from 'node:process';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import adminHandler from '../api/admin/[resource]';
import authHandler from '../api/auth';
import contactHandler from '../api/contact';
import contentHandler from '../api/content';

type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

const envFile = existsSync('.env.local') ? '.env.local' : '.env';
if (existsSync(envFile)) loadEnvFile(envFile);

const fixedRoutes: Record<string, ApiHandler> = {
  '/api/auth': authHandler,
  '/api/contact': contactHandler,
  '/api/content': contentHandler
};

function responseAdapter(response: ServerResponse): VercelResponse {
  const adapted = response as VercelResponse;
  adapted.status = (statusCode: number) => {
    response.statusCode = statusCode;
    return adapted;
  };
  adapted.json = (body: unknown) => {
    if (!response.headersSent) response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(body));
    return adapted;
  };
  return adapted;
}

async function requestBody(request: IncomingMessage): Promise<unknown> {
  if (!['POST', 'PATCH', 'PUT'].includes(request.method ?? '')) return undefined;
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.length;
    if (length > 1024 * 1024) throw new RangeError('Request body exceeds 1 MB.');
    chunks.push(buffer);
  }
  if (!length) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

const server = createServer(async (incoming, outgoing) => {
  const origin = `http://${incoming.headers.host ?? '127.0.0.1'}`;
  const url = new URL(incoming.url ?? '/', origin);
  const resourceMatch = /^\/api\/admin\/([^/]+)\/?$/.exec(url.pathname);
  const handler = fixedRoutes[url.pathname] ?? (resourceMatch ? adminHandler : undefined);
  if (!handler) {
    outgoing.statusCode = 404;
    outgoing.end('Not found');
    return;
  }

  const query: VercelRequest['query'] = {};
  for (const [key, value] of url.searchParams) {
    const previous = query[key];
    query[key] = previous === undefined
      ? value
      : Array.isArray(previous) ? [...previous, value] : [previous, value];
  }
  if (resourceMatch) query['resource'] = decodeURIComponent(resourceMatch[1]);

  try {
    const body = await requestBody(incoming);
    const request = Object.assign(incoming, { body, query }) as VercelRequest;
    await handler(request, responseAdapter(outgoing));
    if (!outgoing.writableEnded) outgoing.end();
  } catch (error) {
    if (error instanceof SyntaxError) {
      outgoing.statusCode = 400;
      outgoing.setHeader('Content-Type', 'application/json; charset=utf-8');
      outgoing.end(JSON.stringify({ error: 'Request body must be valid JSON.' }));
      return;
    }
    if (error instanceof RangeError) {
      outgoing.statusCode = 413;
      outgoing.setHeader('Content-Type', 'application/json; charset=utf-8');
      outgoing.end(JSON.stringify({ error: error.message }));
      return;
    }
    console.error('Local API request failed.', error);
    if (!outgoing.headersSent) outgoing.statusCode = 500;
    if (!outgoing.writableEnded) {
      outgoing.setHeader('Content-Type', 'application/json; charset=utf-8');
      outgoing.end(JSON.stringify({ error: 'The local API request failed.' }));
    }
  }
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Local API listening on http://127.0.0.1:3001');
});
