import type { Evidence } from '@ai-vantage/kg';
import type { CreateEvidenceDto } from '@ai-vantage/contracts';
import { EvidenceRepository, AuditService, type Actor } from '@ai-vantage/db';
import { evidenceToDto } from '../lib/dto-mappers.js';

export class EvidenceService {
  constructor(
    private repo: EvidenceRepository,
    private audit: AuditService,
  ) {}

  async list(limit = 100) {
    const items = await this.repo.findAll(limit);
    return items.map(evidenceToDto);
  }

  async getById(id: string) {
    const evidence = await this.repo.findById(id);
    return evidence ? evidenceToDto(evidence) : null;
  }

  async create(dto: CreateEvidenceDto, actor: Actor) {
    const evidence: Evidence = {
      id: dto.id,
      documentId: dto.documentId,
      sourceType: dto.sourceType as Evidence['sourceType'],
      sourceTitle: dto.sourceTitle,
      sourceUrl: dto.sourceUrl,
      publisher: dto.publisher,
      evidenceSpan: dto.evidenceSpan,
      reliabilityScore: dto.reliabilityScore ?? 0.7,
    };
    const created = await this.repo.create(evidence);
    await this.audit.log({
      actor,
      action: 'create',
      targetType: 'evidence',
      targetId: created.id,
      after: { sourceTitle: created.sourceTitle },
    });
    return evidenceToDto(created);
  }
}
