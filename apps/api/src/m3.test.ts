import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './app.js';
import { buildSeedFromContent } from '@ai-vantage/kg/seed';
import { getDb } from '@ai-vantage/db';
import { EntityRepository, RelationRepository } from '@ai-vantage/db';
import { seedM3Demo } from '@ai-vantage/db/seed-m3';

describe('M3 write API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const seed = buildSeedFromContent();
    const db = getDb();
    await new EntityRepository(db).upsertMany(seed.entities);
    await new RelationRepository(db).upsertMany(seed.relations);
    await seedM3Demo();
    app = createApp();
  });

  it('GET /assertions?status=candidate returns demo candidates', async () => {
    const res = await app.request('/assertions?status=candidate');
    expect(res.status).toBe(200);
    const { assertions } = (await res.json()) as { assertions: { id: string }[] };
    expect(assertions.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /assertions/:id/verify advances status and writes audit log', async () => {
    const listRes = await app.request('/assertions?status=candidate');
    const { assertions } = (await listRes.json()) as {
      assertions: { id: string; status: string }[];
    };
    const target = assertions.find((a) => a.id === 'asrt-amd-candidate') ?? assertions[0];

    const verifyRes = await app.request(`/assertions/${target.id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'test-reviewer' },
      body: JSON.stringify({ reviewedBy: 'test-reviewer' }),
    });
    expect(verifyRes.status).toBe(200);
    const verified = (await verifyRes.json()) as { status: string };
    expect(verified.status).toBe('verified');

    const verifyAgain = await app.request(`/assertions/${target.id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'test-reviewer' },
      body: '{}',
    });
    expect(verifyAgain.status).toBe(200);
    const active = (await verifyAgain.json()) as { status: string };
    expect(active.status).toBe('active');

    const auditRes = await app.request(
      `/audit-logs?targetType=assertion&targetId=${target.id}`,
    );
    expect(auditRes.status).toBe(200);
    const { logs } = (await auditRes.json()) as { logs: { action: string }[] };
    expect(logs.some((l) => l.action === 'verify')).toBe(true);
  });

  it('POST /entities creates entity with audit trail', async () => {
    const id = `test-co-m3-${Date.now()}`;
    const createRes = await app.request('/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'test-editor' },
      body: JSON.stringify({
        id,
        type: 'Company',
        name: 'Test Co M3',
        slug: 'test-co-m3',
        status: 'active',
      }),
    });
    expect(createRes.status).toBe(201);

    const auditRes = await app.request(`/audit-logs?targetType=entity&targetId=${id}`);
    const { logs } = (await auditRes.json()) as { logs: unknown[] };
    expect(logs.length).toBeGreaterThanOrEqual(1);

    await app.request(`/entities/${id}/deprecate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'test-editor' },
      body: '{}',
    });
  });

  it('GET /entities/nvidia/assertions includes active assertions', async () => {
    const res = await app.request('/entities/nvidia/assertions?status=active');
    expect(res.status).toBe(200);
    const { assertions } = (await res.json()) as { assertions: { claimText: string }[] };
    expect(assertions.length).toBeGreaterThanOrEqual(1);
  });
});
