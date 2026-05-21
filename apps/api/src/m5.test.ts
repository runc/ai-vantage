import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './app.js';
import { seedM3Demo } from '@ai-vantage/db/seed-m3';
import { seedM5Demo } from '@ai-vantage/db/seed-m5';

describe('M5 research workbench API', () => {
  const app = createApp();

  beforeAll(async () => {
    await seedM3Demo();
    await seedM5Demo();
  });

  it('GET /research returns index with domain and themes', async () => {
    const res = await app.request('/research');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      domains: { slug: string }[];
      themes: { id: string }[];
      instruments: { id: string }[];
      events: { id: string }[];
    };
    expect(body.domains.some((d) => d.slug === 'ai-industry')).toBe(true);
    expect(body.themes.length).toBeGreaterThanOrEqual(8);
    expect(body.instruments.length).toBeGreaterThanOrEqual(10);
    expect(body.events.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /research/domains/ai-industry returns layers and companies', async () => {
    const res = await app.request('/research/domains/ai-industry');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      layers: { id: string }[];
      companies: { id: string }[];
      themes: { id: string }[];
    };
    expect(body.layers.length).toBe(7);
    expect(body.companies.some((c) => c.id === 'nvidia')).toBe(true);
    expect(body.themes.some((t) => t.id === 'moat-types')).toBe(true);
  });

  it('GET /research/themes/moat-types returns theme entity', async () => {
    const res = await app.request('/research/themes/moat-types');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { entity: { id: string } };
    expect(body.entity.id).toBe('moat-types');
  });

  it('GET /research/instruments/nvidia includes assertions', async () => {
    const res = await app.request('/research/instruments/nvidia');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      entity: { id: string };
      assertions: { claimText: string }[];
      competitors: { id: string }[];
    };
    expect(body.entity.id).toBe('nvidia');
    expect(body.assertions.length).toBeGreaterThan(0);
  });

  it('GET /research/events/evt-blackwell-cycle returns impact paths', async () => {
    const res = await app.request('/research/events/evt-blackwell-cycle');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      affectedCompanies: { id: string }[];
      impactPaths: { path: string[] }[];
    };
    expect(body.affectedCompanies.some((c) => c.id === 'nvidia')).toBe(true);
  });

  it('POST /agent-tools/query-graph explores nvidia', async () => {
    const res = await app.request('/agent-tools/query-graph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '英伟达 上下游' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { explore: { nodeIds: string[] } };
    expect(body.explore.nodeIds).toContain('nvidia');
  });

  it('POST /agent-tools/generate-brief returns markdown', async () => {
    const res = await app.request('/agent-tools/generate-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'domain', id: 'ai-industry' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { markdown: string };
    expect(body.markdown).toContain('AI');
  });
});
