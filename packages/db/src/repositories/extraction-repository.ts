import { eq, desc } from 'drizzle-orm';
import type { ExtractionResult } from '@ai-vantage/ai';
import type { Database } from '../client.js';
import { getTables } from '../schema/index.js';

export interface DocumentExtraction {
  id: string;
  documentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  extractor: string;
  result?: ExtractionResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class ExtractionRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<DocumentExtraction | null> {
    const { documentExtractions } = getTables();
    const rows = await this.db
      .select()
      .from(documentExtractions)
      .where(eq(documentExtractions.id, id))
      .limit(1);
    return rows[0] ? this.rowToExtraction(rows[0]) : null;
  }

  async findByDocumentId(documentId: string): Promise<DocumentExtraction[]> {
    const { documentExtractions } = getTables();
    const rows = await this.db
      .select()
      .from(documentExtractions)
      .where(eq(documentExtractions.documentId, documentId))
      .orderBy(desc(documentExtractions.createdAt));
    return rows.map((row) => this.rowToExtraction(row));
  }

  async create(entry: Omit<DocumentExtraction, 'createdAt' | 'completedAt'>): Promise<DocumentExtraction> {
    const { documentExtractions } = getTables();
    await this.db.insert(documentExtractions).values({
      id: entry.id,
      documentId: entry.documentId,
      status: entry.status,
      extractor: entry.extractor,
      result: entry.result ?? null,
      error: entry.error ?? null,
      completedAt: null,
    });
    return (await this.findById(entry.id))!;
  }

  async update(
    id: string,
    patch: Partial<Pick<DocumentExtraction, 'status' | 'result' | 'error' | 'completedAt'>>,
  ): Promise<DocumentExtraction | null> {
    const { documentExtractions } = getTables();
    const existing = await this.findById(id);
    if (!existing) return null;
    await this.db
      .update(documentExtractions)
      .set({
        status: patch.status ?? existing.status,
        result: patch.result ?? existing.result ?? null,
        error: patch.error ?? existing.error ?? null,
        completedAt: patch.completedAt ?? existing.completedAt ?? null,
      })
      .where(eq(documentExtractions.id, id));
    return this.findById(id);
  }

  private rowToExtraction(row: Record<string, unknown>): DocumentExtraction {
    return {
      id: row.id as string,
      documentId: row.documentId as string,
      status: row.status as DocumentExtraction['status'],
      extractor: row.extractor as string,
      result: row.result as ExtractionResult | undefined,
      error: (row.error as string) ?? undefined,
      createdAt: row.createdAt as Date,
      completedAt: (row.completedAt as Date) ?? undefined,
    };
  }
}
