import type { Assertion } from '@ai-vantage/kg';
import { RecordStatus } from '@ai-vantage/kg';
import type { CreateAssertionDto, UpdateAssertionDto } from '@ai-vantage/contracts';
import {
  AssertionRepository,
  EntityRepository,
  EvidenceRepository,
  AuditService,
  type Actor,
} from '@ai-vantage/db';
import { assertionToDto } from '../lib/dto-mappers.js';

export class AssertionService {
  constructor(
    private repo: AssertionRepository,
    private entityRepo: EntityRepository,
    private evidenceRepo: EvidenceRepository,
    private audit: AuditService,
  ) {}

  private async enrich(assertions: Assertion[]) {
    const entityIds = new Set<string>();
    for (const a of assertions) {
      entityIds.add(a.subjectEntityId);
      if (a.objectEntityId) entityIds.add(a.objectEntityId);
    }
    const entities = await this.entityRepo.findByIds([...entityIds]);
    const nameById = new Map(entities.map((e) => [e.id, e.name]));
    return assertions.map((a) =>
      assertionToDto(a, {
        subjectName: nameById.get(a.subjectEntityId),
        objectName: a.objectEntityId ? nameById.get(a.objectEntityId) : undefined,
      }),
    );
  }

  async list(params: {
    status?: string;
    subjectEntityId?: string;
    entityIds?: string[];
    limit?: number;
  }) {
    const items = await this.repo.findMany(params);
    return this.enrich(items);
  }

  async getById(id: string) {
    const assertion = await this.repo.findById(id);
    if (!assertion) return null;
    const [dto] = await this.enrich([assertion]);
    return dto;
  }

  async getByEntityId(entityId: string, status?: string) {
    const items = await this.repo.findBySubjectEntityId(entityId, status);
    return this.enrich(items);
  }

  async create(dto: CreateAssertionDto, actor: Actor) {
    const assertion: Assertion = {
      id: dto.id,
      subjectEntityId: dto.subjectEntityId,
      predicate: dto.predicate as Assertion['predicate'],
      objectEntityId: dto.objectEntityId,
      claimText: dto.claimText,
      confidence: dto.confidence ?? 0.5,
      status: dto.status as Assertion['status'],
      evidenceIds: dto.evidenceIds ?? [],
      generatedBy: dto.generatedBy ?? actor.id,
    };
    const created = await this.repo.create(assertion);
    await this.audit.log({
      actor,
      action: 'create',
      targetType: 'assertion',
      targetId: created.id,
      after: { status: created.status, claimText: created.claimText },
    });
    const [dtoOut] = await this.enrich([created]);
    return dtoOut;
  }

  async update(id: string, patch: UpdateAssertionDto, actor: Actor) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const updated = await this.repo.update(id, {
      ...(patch.subjectEntityId !== undefined && { subjectEntityId: patch.subjectEntityId }),
      ...(patch.predicate !== undefined && { predicate: patch.predicate as Assertion['predicate'] }),
      ...(patch.objectEntityId !== undefined && { objectEntityId: patch.objectEntityId }),
      ...(patch.claimText !== undefined && { claimText: patch.claimText }),
      ...(patch.confidence !== undefined && { confidence: patch.confidence }),
      ...(patch.status !== undefined && { status: patch.status as Assertion['status'] }),
      ...(patch.evidenceIds !== undefined && { evidenceIds: patch.evidenceIds }),
      ...(patch.generatedBy !== undefined && { generatedBy: patch.generatedBy }),
    });
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'update',
      targetType: 'assertion',
      targetId: id,
      before: { status: before.status },
      after: { status: updated.status },
    });
    const [dtoOut] = await this.enrich([updated]);
    return dtoOut;
  }

  async verify(id: string, actor: Actor, reviewedBy?: string) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const nextStatus =
      before.status === RecordStatus.verified ? RecordStatus.active : RecordStatus.verified;
    const updated = await this.repo.update(id, {
      status: nextStatus as Assertion['status'],
      reviewedBy: reviewedBy ?? actor.id,
    });
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'verify',
      targetType: 'assertion',
      targetId: id,
      before: { status: before.status },
      after: { status: updated.status },
    });
    const [dtoOut] = await this.enrich([updated]);
    return dtoOut;
  }

  async reject(id: string, actor: Actor, reason?: string) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const updated = await this.repo.update(id, {
      status: RecordStatus.rejected as Assertion['status'],
      reviewedBy: actor.id,
    });
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'reject',
      targetType: 'assertion',
      targetId: id,
      before: { status: before.status },
      after: { status: updated.status },
      reason,
    });
    const [dtoOut] = await this.enrich([updated]);
    return dtoOut;
  }

  async deprecate(id: string, actor: Actor, reason?: string) {
    const before = await this.repo.findById(id);
    if (!before) return null;
    const updated = await this.repo.update(id, {
      status: RecordStatus.deprecated as Assertion['status'],
      reviewedBy: actor.id,
    });
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'deprecate',
      targetType: 'assertion',
      targetId: id,
      before: { status: before.status },
      after: { status: updated.status },
      reason,
    });
    const [dtoOut] = await this.enrich([updated]);
    return dtoOut;
  }

  async linkEvidence(id: string, evidenceId: string, actor: Actor) {
    const evidence = await this.evidenceRepo.findById(evidenceId);
    if (!evidence) return { error: 'evidence_not_found' as const };
    const before = await this.repo.findById(id);
    if (!before) return null;
    const updated = await this.repo.appendEvidenceId(id, evidenceId);
    if (!updated) return null;
    await this.audit.log({
      actor,
      action: 'link_evidence',
      targetType: 'assertion',
      targetId: id,
      after: { evidenceId },
    });
    const [dtoOut] = await this.enrich([updated]);
    return dtoOut;
  }
}
