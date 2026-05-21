import type { EntityDto, RelationDto, AssertionDto, EvidenceDto, AuditLogDto } from '@ai-vantage/contracts';
import type { Entity, Relation, Assertion, Evidence } from '@ai-vantage/kg';
import type { AuditLogEntry } from '@ai-vantage/db';

function toIso(d?: Date): string | undefined {
  return d ? d.toISOString() : undefined;
}

export function entityToDto(e: Entity): EntityDto {
  return {
    id: e.id,
    type: e.type,
    name: e.name,
    slug: e.slug,
    aliases: e.aliases,
    description: e.description ?? null,
    properties: e.properties,
    status: e.status,
    source: e.source ?? null,
    createdAt: toIso(e.createdAt),
    updatedAt: toIso(e.updatedAt),
  };
}

export function relationToDto(r: Relation): RelationDto {
  return {
    id: r.id,
    subjectEntityId: r.subjectEntityId,
    predicate: r.predicate,
    objectEntityId: r.objectEntityId,
    properties: r.properties,
    confidence: r.confidence,
    status: r.status,
    label: r.label ?? null,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

export function assertionToDto(
  a: Assertion,
  names?: { subjectName?: string; objectName?: string },
): AssertionDto {
  return {
    id: a.id,
    subjectEntityId: a.subjectEntityId,
    predicate: a.predicate,
    objectEntityId: a.objectEntityId ?? null,
    claimText: a.claimText,
    confidence: a.confidence,
    status: a.status,
    evidenceIds: a.evidenceIds ?? [],
    generatedBy: a.generatedBy ?? null,
    reviewedBy: a.reviewedBy ?? null,
    validFrom: toIso(a.validFrom) ?? null,
    validTo: toIso(a.validTo) ?? null,
    createdAt: toIso(a.createdAt),
    updatedAt: toIso(a.updatedAt),
    subjectName: names?.subjectName,
    objectName: names?.objectName,
  };
}

export function evidenceToDto(e: Evidence): EvidenceDto {
  return {
    id: e.id,
    documentId: e.documentId ?? null,
    sourceType: e.sourceType,
    sourceTitle: e.sourceTitle,
    sourceUrl: e.sourceUrl ?? null,
    publisher: e.publisher ?? null,
    publishedAt: toIso(e.publishedAt) ?? null,
    evidenceSpan: e.evidenceSpan ?? null,
    pageNumber: e.pageNumber ?? null,
    reliabilityScore: e.reliabilityScore,
    createdAt: toIso(e.createdAt),
  };
}

export function auditLogToDto(entry: AuditLogEntry): AuditLogDto {
  return {
    id: entry.id,
    actorType: entry.actorType,
    actorId: entry.actorId ?? null,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    before: entry.before ?? null,
    after: entry.after ?? null,
    reason: entry.reason ?? null,
    createdAt: entry.createdAt.toISOString(),
  };
}
