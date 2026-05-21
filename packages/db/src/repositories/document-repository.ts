import { eq, desc } from 'drizzle-orm';
import type { Database } from '../client.js';
import { getTables } from '../schema/index.js';
import type { Document } from '@ai-vantage/kg';

export class DocumentRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Document | null> {
    const { documents } = getTables();
    const rows = await this.db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return rows[0] ? this.rowToDocument(rows[0]) : null;
  }

  async findAll(limit = 50): Promise<Document[]> {
    const { documents } = getTables();
    const rows = await this.db
      .select()
      .from(documents)
      .orderBy(desc(documents.updatedAt))
      .limit(limit);
    return rows.map((row) => this.rowToDocument(row));
  }

  async create(item: Document): Promise<Document> {
    const { documents } = getTables();
    await this.db.insert(documents).values({
      id: item.id,
      title: item.title,
      sourceType: item.sourceType,
      sourceUrl: item.sourceUrl ?? null,
      publisher: item.publisher ?? null,
      publishedAt: item.publishedAt ?? null,
      rawText: item.rawText ?? null,
      contentHash: item.contentHash ?? null,
      parseStatus: item.parseStatus,
      ingestionStatus: item.ingestionStatus,
      metadata: item.metadata,
      updatedAt: new Date(),
    });
    return (await this.findById(item.id))!;
  }

  async update(id: string, patch: Partial<Document>): Promise<Document | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const { documents } = getTables();
    const merged: Document = { ...existing, ...patch, id, updatedAt: new Date() };
    await this.db
      .update(documents)
      .set({
        title: merged.title,
        sourceType: merged.sourceType,
        sourceUrl: merged.sourceUrl ?? null,
        publisher: merged.publisher ?? null,
        publishedAt: merged.publishedAt ?? null,
        rawText: merged.rawText ?? null,
        contentHash: merged.contentHash ?? null,
        parseStatus: merged.parseStatus,
        ingestionStatus: merged.ingestionStatus,
        metadata: merged.metadata,
        updatedAt: merged.updatedAt,
      })
      .where(eq(documents.id, id));
    return this.findById(id);
  }

  private rowToDocument(row: Record<string, unknown>): Document {
    return {
      id: row.id as string,
      title: row.title as string,
      sourceType: row.sourceType as Document['sourceType'],
      sourceUrl: (row.sourceUrl as string) ?? undefined,
      publisher: (row.publisher as string) ?? undefined,
      publishedAt: (row.publishedAt as Date) ?? undefined,
      rawText: (row.rawText as string) ?? undefined,
      contentHash: (row.contentHash as string) ?? undefined,
      parseStatus: row.parseStatus as Document['parseStatus'],
      ingestionStatus: row.ingestionStatus as Document['ingestionStatus'],
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    };
  }
}
