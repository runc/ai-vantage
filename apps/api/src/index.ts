import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const port = Number(process.env.API_PORT ?? 3001);

const app = createApp();

console.log(`AI Vantage API listening on http://localhost:${port}`);
console.log(`OpenAPI: http://localhost:${port}/openapi`);

serve({ fetch: app.fetch, port });
