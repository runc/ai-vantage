import { eq, and, desc, inArray } from 'drizzle-orm';
import type { Database } from '../client.js';
import { getTables } from '../schema/index.js';
import type { Assertion } from '@ai-vantage/kg';

export class AssertionRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Assertion | null> {
    const { assertions } = getTables();
    const rows = await this.db.select().from(assertions).where(eq(assertions.id, id)).limit(1);
    return rows[0] ? this.rowToAssertion(rows[0]) : null;
  }

  async findActiveBySubjectEntityId(entityId: string): Promise<Assertion[]> {
    return this.findBySubjectEntityId(entityId, 'active');
  }

  async findBySubjectEntityId(entityId: string, status?: string): Promise<Assertion[]> {
    const { assertions } = getTables();
    const conditions = [eq(assertions.subjectEntityId, entityId)];
    if (status) conditions.push(eq(assertions.status, status));
    const rows = await this.db
      .select()
      .from(assertions)
      .where(and(...conditions))
      .orderBy(desc(assertions.updatedAt));
    return rows.map((row) => this.rowToAssertion(row));
  }

  async findMany(params: {
    status?: string;
    subjectEntityId?: string;
    entityIds?: string[];
    limit?: number;
  }): Promise<Assertion[]> {
    const { assertions } = getTables();
    const conditions = [];
    if (params.status) conditions.push(eq(assertions.status, params.status));
    if (params.subjectEntityId) {
      conditions.push(eq(assertions.subjectEntityId, params.subjectEntityId));
    }
    if (params.entityIds && params.entityIds.length > 0) {
      conditions.push(inArray(assertions.subjectEntityId, params.entityIds));
    }

    const base = this.db
      .select()
      .from(assertions)
      .orderBy(desc(assertions.updatedAt))
      .limit(params.limit ?? 100);

    const rows =
      conditions.length > 0 ? await base.where(and(...conditions)) : await base;
    return rows.map((row) => this.rowToAssertion(row));
  }

  async create(item: Assertion): Promise<Assertion> {
    const { assertions } = getTables();
    await this.db.insert(assertions).values({
      id: item.id,
      subjectEntityId: item.subjectEntityId,
      predicate: item.predicate,
      objectEntityId: item.objectEntityId ?? null,
      claimText: item.claimText,
      confidence: item.confidence,
      status: item.status,
      evidenceIds: item.evidenceIds ?? [],
      generatedBy: item.generatedBy ?? null,
      reviewedBy: item.reviewedBy ?? null,
      validFrom: item.validFrom ?? null,
      validTo: item.validTo ?? null,
      updatedAt: new Date(),
    });
    return (await this.findById(item.id))!;
  }

  async update(id: string, patch: Partial<Assertion>): Promise<Assertion | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const { assertions } = getTables();
    const merged: Assertion = { ...existing, ...patch, id, updatedAt: new Date() };
    await this.db
      .update(assertions)
      .set({
        subjectEntityId: merged.subjectEntityId,
        predicate: merged.predicate,
        objectEntityId: merged.objectEntityId ?? null,
        claimText: merged.claimText,
        confidence: merged.confidence,
        status: merged.status,
        evidenceIds: merged.evidenceIds ?? [],
        generatedBy: merged.generatedBy ?? null,
        reviewedBy: merged.reviewedBy ?? null,
        validFrom: merged.validFrom ?? null,
        validTo: merged.validTo ?? null,
        updatedAt: merged.updatedAt,
      })
      .where(eq(assertions.id, id));
    return this.findById(id);
  }

  async appendEvidenceId(id: string, evidenceId: string): Promise<Assertion | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const ids = [...(existing.evidenceIds ?? [])];
    if (!ids.includes(evidenceId)) ids.push(evidenceId);
    return this.update(id, { evidenceIds: ids });
  }

  private rowToAssertion(row: Record<string, unknown>): Assertion {
    return {
      id: row.id as string,
      subjectEntityId: row.subjectEntityId as string,
      predicate: row.predicate as Assertion['predicate'],
      objectEntityId: (row.objectEntityId as string) ?? undefined,
      claimText: row.claimText as string,
      confidence: row.confidence as number,
      status: row.status as Assertion['status'],
      evidenceIds: (row.evidenceIds as string[]) ?? [],
      generatedBy: (row.generatedBy as string) ?? undefined,
      reviewedBy: (row.reviewedBy as string) ?? undefined,
      validFrom: (row.validFrom as Date) ?? undefined,
      validTo: (row.validTo as Date) ?? undefined,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }
}
