import type { Assertion } from '@ai-vantage/kg';

export interface ExtractedEvidence {
  id: string;
  sourceTitle: string;
  evidenceSpan: string;
  reliabilityScore: number;
}

export interface ExtractedAssertion {
  id: string;
  subjectEntityId: string;
  predicate: string;
  objectEntityId?: string;
  claimText: string;
  confidence: number;
  evidenceId: string;
}

export interface ExtractionConflict {
  candidateAssertionId: string;
  existingAssertionId: string;
  reason: string;
  candidateClaim: string;
  existingClaim: string;
}

export interface ExtractionResult {
  extractor: 'stub' | 'openai';
  assertions: ExtractedAssertion[];
  evidences: ExtractedEvidence[];
  conflicts: ExtractionConflict[];
}

export interface PipelineInput {
  documentId: string;
  title: string;
  rawText: string;
  primaryEntityId?: string;
  relatedEntityIds?: string[];
  existingActiveAssertions?: Assertion[];
}
