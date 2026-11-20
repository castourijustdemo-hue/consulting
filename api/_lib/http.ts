import { VercelResponse } from '@vercel/node';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sendMethodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: `Method not allowed. Use ${allowed.join(' or ')}.` });
}

export function sendServerError(res: VercelResponse, error: unknown, message: string): void {
  console.error(message, error);
  res.status(500).json({ error: message });
}
