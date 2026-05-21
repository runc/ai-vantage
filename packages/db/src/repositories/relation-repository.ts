import { eq, inArray, or } from 'drizzle-orm';
import type { Database } from '../client.js';
import { getTables } from '../schema/index.js';
import type { Relation } from '@ai-vantage/kg';

export class RelationRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Relation | null> {
    const { relations } = getTables();
    const rows = await this.db.select().from(relations).where(eq(relations.id, id)).limit(1);
    return rows[0] ? this.rowToRelation(rows[0]) : null;
  }

  async findAll(status?: string): Promise<Relation[]> {
    const { relations } = getTables();
    const rows = status
      ? await this.db.select().from(relations).where(eq(relations.status, status))
      : await this.db.select().from(relations);
    return rows.map((row) => this.rowToRelation(row));
  }

  async findAllActive(): Promise<Relation[]> {
    const { relations } = getTables();
    const rows = await this.db
      .select()
      .from(relations)
      .where(eq(relations.status, 'active'));
    return rows.map((row) => this.rowToRelation(row));
  }

  async findByEntityIds(entityIds: string[]): Promise<Relation[]> {
    const { relations } = getTables();
    if (entityIds.length === 0) return [];
    const rows = await this.db
      .select()
      .from(relations)
      .where(
        or(
          inArray(relations.subjectEntityId, entityIds),
          inArray(relations.objectEntityId, entityIds),
        ),
      );
    return rows.filter((r) => r.status === 'active').map((row) => this.rowToRelation(row));
  }

  async create(item: Relation): Promise<Relation> {
    const { relations } = getTables();
    await this.db.insert(relations).values({
      id: item.id,
      subjectEntityId: item.subjectEntityId,
      predicate: item.predicate,
      objectEntityId: item.objectEntityId,
      properties: item.properties,
      confidence: item.confidence,
      status: item.status,
      label: item.label ?? null,
      validFrom: item.validFrom ?? null,
      validTo: item.validTo ?? null,
      updatedAt: new Date(),
    });
    return (await this.findById(item.id))!;
  }

  async update(id: string, patch: Partial<Relation>): Promise<Relation | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const { relations } = getTables();
    const merged: Relation = { ...existing, ...patch, id, updatedAt: new Date() };
    await this.db
      .update(relations)
      .set({
        subjectEntityId: merged.subjectEntityId,
        predicate: merged.predicate,
        objectEntityId: merged.objectEntityId,
        properties: merged.properties,
        confidence: merged.confidence,
        status: merged.status,
        label: merged.label ?? null,
        validFrom: merged.validFrom ?? null,
        validTo: merged.validTo ?? null,
        updatedAt: merged.updatedAt,
      })
      .where(eq(relations.id, id));
    return this.findById(id);
  }

  async deprecate(id: string): Promise<Relation | null> {
    return this.update(id, { status: 'deprecated' as Relation['status'] });
  }

  async upsertMany(items: Relation[]): Promise<void> {
    const { relations } = getTables();
    for (const item of items) {
      await this.db
        .insert(relations)
        .values({
          id: item.id,
          subjectEntityId: item.subjectEntityId,
          predicate: item.predicate,
          objectEntityId: item.objectEntityId,
          properties: item.properties,
          confidence: item.confidence,
          status: item.status,
          label: item.label ?? null,
          validFrom: item.validFrom ?? null,
          validTo: item.validTo ?? null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: relations.id,
          set: {
            subjectEntityId: item.subjectEntityId,
            predicate: item.predicate,
            objectEntityId: item.objectEntityId,
            properties: item.properties,
            confidence: item.confidence,
            status: item.status,
            label: item.label ?? null,
            validFrom: item.validFrom ?? null,
            validTo: item.validTo ?? null,
            updatedAt: new Date(),
          },
        });
    }
  }

  private rowToRelation(row: Record<string, unknown>): Relation {
    return {
      id: row.id as string,
      subjectEntityId: row.subjectEntityId as string,
      predicate: row.predicate as Relation['predicate'],
      objectEntityId: row.objectEntityId as string,
      properties: (row.properties as Record<string, unknown>) ?? {},
      confidence: row.confidence as number,
      status: row.status as Relation['status'],
      label: (row.label as string) ?? undefined,
      validFrom: (row.validFrom as Date) ?? undefined,
      validTo: (row.validTo as Date) ?? undefined,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }
}
