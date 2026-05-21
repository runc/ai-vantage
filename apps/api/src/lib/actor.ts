import type { Context } from 'hono';
import type { Actor } from '@ai-vantage/db';

export function getActor(c: Context): Actor {
  const id = c.req.header('X-Actor-Id') ?? 'local-user';
  return { type: 'human', id };
}
