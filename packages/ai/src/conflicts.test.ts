import { describe, it, expect } from 'vitest';
import { detectConflicts } from './conflicts.js';
import type { ExtractedAssertion } from './types.js';
import { RecordStatus } from '@ai-vantage/kg';

describe('detectConflicts', () => {
  it('flags opposing claims on same subject', () => {
    const existing = [
      {
        id: 'asrt-a',
        subjectEntityId: 'nvidia',
        predicate: 'relates_to',
        claimText: 'HBM 供给仍然紧张',
        confidence: 0.8,
        status: RecordStatus.active,
        evidenceIds: [],
      },
    ];
    const candidates: ExtractedAssertion[] = [
      {
        id: 'c1',
        subjectEntityId: 'nvidia',
        predicate: 'relates_to',
        claimText: 'HBM 供给紧张程度有所缓解',
        confidence: 0.5,
        evidenceId: 'e1',
      },
    ];
    const conflicts = detectConflicts(existing, candidates);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].existingAssertionId).toBe('asrt-a');
  });
});
