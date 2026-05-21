import type { Entity } from '@ai-vantage/kg';
import { RecordStatus } from '@ai-vantage/kg';
import type { CreateEntityDto, UpdateEntityDto } from '@ai-vantage/contracts';
import { EntityRepository, AuditService, type Actor } from '@ai-vantage/db';
import { entityToDto } from '../lib/dto-mappers.js';

export class EntityService {
  constructor(
    private repo: EntityRepository,
    private audit: AuditService,
  ) {}

  async list(params: { status?: string; q?: string; limit?: number }) {
    const items = params.q
      ? await this.repo.search(params.q, params.limit ?? 50)
      : await this.repo.findAll(params.status);
    return items.map(entityToDto);
  }

  async getById(id: string) {
    const entity = await this.repo.findById(id);
    return entity ? entityToDto(entity) : null;
  }

  async create(dto: CreateEntityDto, actor: Actor) {
    const entity: Entity = {
      id: dto.id,
      type: dto.type as Entity['type'],
      name: dto.name,
      slug: dto.slug,
      aliases: dto.aliases ?? [],
      description: dto.description,
      properties: dto.properties ?? {},
      status: (dto.status ?? RecordStatus.active) as Entity['status'],
      source: dto.source,
    };
    const created = await this.repo.create(entity);
    await this.audit.log({
      actor,
      action: 'create',
      targetType: 'entity',
      targetId: created.id,
      after: entityToDto(created) as unknown as Record<string, unknown>,
    });
    return entityToDto(created);
  }

  async update(id: string, dto: UpdateEntityDto, actor: Actor) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const patch: Partial<Entity> = {
      ...(dto.type !== undefined && { type: dto.type as Entity['type'] }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.aliases !== undefined && { aliases: dto.aliases }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.properties !== undefined && { properties: dto.properties }),
      ...(dto.status !== undefined && { status: dto.status as Entity['status'] }),
      ...(dto.source !== undefined && { source: dto.source }),
    };
    const updated = await this.repo.update(id, patch);
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'update',
      targetType: 'entity',
      targetId: id,
      before: entityToDto(before) as unknown as Record<string, unknown>,
      after: entityToDto(updated) as unknown as Record<string, unknown>,
    });
    return entityToDto(updated);
  }

  async deprecate(id: string, actor: Actor, reason?: string) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const updated = await this.repo.deprecate(id);
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'deprecate',
      targetType: 'entity',
      targetId: id,
      before: entityToDto(before) as unknown as Record<string, unknown>,
      after: entityToDto(updated) as unknown as Record<string, unknown>,
      reason,
    });
    return entityToDto(updated);
  }
}
