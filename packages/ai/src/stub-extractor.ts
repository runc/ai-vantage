import { RelationPredicate, RecordStatus } from '@ai-vantage/kg';
import type { PipelineInput, ExtractionResult, ExtractedAssertion, ExtractedEvidence } from './types.js';
import { detectConflicts } from './conflicts.js';

const MAX_CLAIMS = 6;
const MIN_LEN = 24;
const MAX_LEN = 320;

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[。！？.!?])\s*|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_LEN && s.length <= MAX_LEN);
}

function inferPredicate(sentence: string): string {
  if (/竞争|对手|替代|rival|compete/i.test(sentence)) return RelationPredicate.competes_with;
  if (/供应|上游|下游|supply|upstream/i.test(sentence)) return RelationPredicate.supplies_to;
  if (/依赖|depend/i.test(sentence)) return RelationPredicate.depends_on;
  if (/风险|下滑|下降|流失|risk|decline/i.test(sentence)) return RelationPredicate.hurt_by;
  if (/受益|增长|主导|份额|benefit|growth|dominant/i.test(sentence)) return RelationPredicate.benefits_from;
  return RelationPredicate.relates_to;
}

export function runStubExtraction(input: PipelineInput): ExtractionResult {
  const subjectId = input.primaryEntityId ?? 'unknown';
  const sentences = splitSentences(input.rawText).slice(0, MAX_CLAIMS);

  const evidences: ExtractedEvidence[] = [];
  const assertions: ExtractedAssertion[] = [];

  sentences.forEach((claimText, index) => {
    const evidenceId = `ev-ai-${input.documentId}-${index}`;
    const assertionId = `asrt-ai-${input.documentId}-${index}`;

    evidences.push({
      id: evidenceId,
      sourceTitle: input.title,
      evidenceSpan: claimText.slice(0, 200),
      reliabilityScore: 0.55,
    });

    assertions.push({
      id: assertionId,
      subjectEntityId: subjectId,
      predicate: inferPredicate(claimText),
      objectEntityId: input.relatedEntityIds?.[0],
      claimText,
      confidence: 0.42 + Math.min(0.2, claimText.length / 500),
      evidenceId,
    });
  });

  const conflicts = detectConflicts(input.existingActiveAssertions ?? [], assertions);

  return {
    extractor: 'stub',
    assertions,
    evidences,
    conflicts,
  };
}

/** Exported for tests — candidate status is applied at ingest time. */
export const CANDIDATE_STATUS = RecordStatus.candidate;
