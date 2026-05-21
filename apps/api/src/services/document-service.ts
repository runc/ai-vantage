import { createHash } from 'node:crypto';
import type { Document } from '@ai-vantage/kg';
import type { CreateDocumentDto } from '@ai-vantage/contracts';
import { loadMdxDocument } from '@ai-vantage/ai';
import { DocumentRepository, AuditService, type Actor } from '@ai-vantage/db';

function toIso(d?: Date): string | undefined {
  return d ? d.toISOString() : undefined;
}

export function documentToDto(doc: Document) {
  return {
    id: doc.id,
    title: doc.title,
    sourceType: doc.sourceType,
    sourceUrl: doc.sourceUrl ?? null,
    publisher: doc.publisher ?? null,
    publishedAt: toIso(doc.publishedAt) ?? null,
    parseStatus: doc.parseStatus,
    ingestionStatus: doc.ingestionStatus,
    metadata: doc.metadata,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export class DocumentService {
  constructor(
    private repo: DocumentRepository,
    private audit: AuditService,
  ) {}

  async list() {
    const docs = await this.repo.findAll();
    return docs.map(documentToDto);
  }

  async getById(id: string) {
    const doc = await this.repo.findById(id);
    return doc ? documentToDto(doc) : null;
  }

  async create(dto: CreateDocumentDto, actor: Actor) {
    const hash = dto.rawText
      ? createHash('sha256').update(dto.rawText).digest('hex').slice(0, 16)
      : undefined;
    const doc: Document = {
      id: dto.id,
      title: dto.title,
      sourceType: dto.sourceType as Document['sourceType'],
      sourceUrl: dto.sourceUrl,
      publisher: dto.publisher,
      rawText: dto.rawText,
      contentHash: hash,
      parseStatus: dto.rawText ? 'parsed' : 'pending',
      ingestionStatus: 'registered',
      metadata: dto.metadata ?? {},
    };
    const created = await this.repo.create(doc);
    await this.audit.log({
      actor,
      action: 'create',
      targetType: 'document',
      targetId: created.id,
      after: { title: created.title },
    });
    return documentToDto(created);
  }

  async registerFromMdx(kind: 'targets' | 'layers' | 'concepts', slug: string, actor: Actor) {
    const source = loadMdxDocument(kind, slug);
    if (!source) return null;
    const existing = await this.repo.findById(source.id);
    if (existing) return documentToDto(existing);

    return this.create(
      {
        id: source.id,
        title: source.title,
        sourceType: source.sourceType,
        sourceUrl: source.sourceUrl,
        rawText: source.rawText,
        metadata: source.metadata,
      },
      actor,
    );
  }
}
