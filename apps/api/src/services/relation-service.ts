import type { Relation } from '@ai-vantage/kg';
import { RecordStatus } from '@ai-vantage/kg';
import type { CreateRelationDto, UpdateRelationDto } from '@ai-vantage/contracts';
import { RelationRepository, AuditService, type Actor } from '@ai-vantage/db';
import { relationToDto } from '../lib/dto-mappers.js';

export class RelationService {
  constructor(
    private repo: RelationRepository,
    private audit: AuditService,
  ) {}

  async list(params: { status?: string; entityId?: string }) {
    let items = await this.repo.findAll(params.status);
    if (params.entityId) {
      items = items.filter(
        (r) =>
          r.subjectEntityId === params.entityId || r.objectEntityId === params.entityId,
      );
    }
    return items.map(relationToDto);
  }

  async getById(id: string) {
    const relation = await this.repo.findById(id);
    return relation ? relationToDto(relation) : null;
  }

  async create(dto: CreateRelationDto, actor: Actor) {
    const relation: Relation = {
      id: dto.id,
      subjectEntityId: dto.subjectEntityId,
      predicate: dto.predicate as Relation['predicate'],
      objectEntityId: dto.objectEntityId,
      properties: dto.properties ?? {},
      confidence: dto.confidence ?? 1,
      status: (dto.status ?? RecordStatus.active) as Relation['status'],
      label: dto.label,
    };
    const created = await this.repo.create(relation);
    await this.audit.log({
      actor,
      action: 'create',
      targetType: 'relation',
      targetId: created.id,
      after: relationToDto(created) as unknown as Record<string, unknown>,
    });
    return relationToDto(created);
  }

  async update(id: string, dto: UpdateRelationDto, actor: Actor) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const patch: Partial<Relation> = {
      ...(dto.subjectEntityId !== undefined && { subjectEntityId: dto.subjectEntityId }),
      ...(dto.predicate !== undefined && { predicate: dto.predicate as Relation['predicate'] }),
      ...(dto.objectEntityId !== undefined && { objectEntityId: dto.objectEntityId }),
      ...(dto.properties !== undefined && { properties: dto.properties }),
      ...(dto.confidence !== undefined && { confidence: dto.confidence }),
      ...(dto.status !== undefined && { status: dto.status as Relation['status'] }),
      ...(dto.label !== undefined && { label: dto.label }),
    };
    const updated = await this.repo.update(id, patch);
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'update',
      targetType: 'relation',
      targetId: id,
      before: relationToDto(before) as unknown as Record<string, unknown>,
      after: relationToDto(updated) as unknown as Record<string, unknown>,
    });
    return relationToDto(updated);
  }

  async deprecate(id: string, actor: Actor, reason?: string) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const updated = await this.repo.deprecate(id);
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'deprecate',
      targetType: 'relation',
      targetId: id,
      before: relationToDto(before) as unknown as Record<string, unknown>,
      after: relationToDto(updated) as unknown as Record<string, unknown>,
      reason,
    });
    return relationToDto(updated);
  }
}
