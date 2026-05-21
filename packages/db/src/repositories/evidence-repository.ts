import { eq, inArray } from 'drizzle-orm';
import type { Database } from '../client.js';
import { getTables } from '../schema/index.js';
import type { Evidence } from '@ai-vantage/kg';

export class EvidenceRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Evidence | null> {
    const { evidences } = getTables();
    const rows = await this.db.select().from(evidences).where(eq(evidences.id, id)).limit(1);
    return rows[0] ? this.rowToEvidence(rows[0]) : null;
  }

  async findByIds(ids: string[]): Promise<Evidence[]> {
    const { evidences } = getTables();
    if (ids.length === 0) return [];
    const rows = await this.db.select().from(evidences).where(inArray(evidences.id, ids));
    return rows.map((row) => this.rowToEvidence(row));
  }

  async findAll(limit = 100): Promise<Evidence[]> {
    const { evidences } = getTables();
    const rows = await this.db.select().from(evidences).limit(limit);
    return rows.map((row) => this.rowToEvidence(row));
  }

  async create(item: Evidence): Promise<Evidence> {
    const { evidences } = getTables();
    await this.db.insert(evidences).values({
      id: item.id,
      documentId: item.documentId ?? null,
      sourceType: item.sourceType,
      sourceTitle: item.sourceTitle,
      sourceUrl: item.sourceUrl ?? null,
      publisher: item.publisher ?? null,
      publishedAt: item.publishedAt ?? null,
      evidenceSpan: item.evidenceSpan ?? null,
      pageNumber: item.pageNumber ?? null,
      reliabilityScore: item.reliabilityScore,
    });
    return (await this.findById(item.id))!;
  }

  private rowToEvidence(row: Record<string, unknown>): Evidence {
    return {
      id: row.id as string,
      documentId: (row.documentId as string) ?? undefined,
      sourceType: row.sourceType as Evidence['sourceType'],
      sourceTitle: row.sourceTitle as string,
      sourceUrl: (row.sourceUrl as string) ?? undefined,
      publisher: (row.publisher as string) ?? undefined,
      publishedAt: (row.publishedAt as Date) ?? undefined,
      evidenceSpan: (row.evidenceSpan as string) ?? undefined,
      pageNumber: (row.pageNumber as number) ?? undefined,
      reliabilityScore: row.reliabilityScore as number,
      createdAt: row.createdAt as Date,
    };
  }
}
