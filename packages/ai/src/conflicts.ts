import type { Assertion } from '@ai-vantage/kg';
import type { ExtractedAssertion, ExtractionConflict } from './types.js';

/** Simple bilingual keyword opposition for M4 conflict hints. */
const OPPOSING_PAIRS: [string, string][] = [
  ['紧张', '缓解'],
  ['短缺', '过剩'],
  ['主导', '落后'],
  ['增长', '下降'],
  ['上升', '下滑'],
  ['份额提升', '份额下降'],
  ['受益', '受损'],
  ['领先', '落后'],
  ['dominant', 'losing'],
  ['growth', 'decline'],
];

function hasPair(textA: string, textB: string, [w1, w2]: [string, string]): boolean {
  const a1 = textA.includes(w1);
  const a2 = textA.includes(w2);
  const b1 = textB.includes(w1);
  const b2 = textB.includes(w2);
  return (a1 && b2) || (a2 && b1);
}

export function detectConflicts(
  existing: Assertion[],
  candidates: ExtractedAssertion[],
): ExtractionConflict[] {
  const conflicts: ExtractionConflict[] = [];
  const active = existing.filter((a) => a.status === 'active');

  for (const candidate of candidates) {
    const peers = active.filter((e) => e.subjectEntityId === candidate.subjectEntityId);
    for (const ex of peers) {
      for (const pair of OPPOSING_PAIRS) {
        if (hasPair(candidate.claimText, ex.claimText, pair)) {
          conflicts.push({
            candidateAssertionId: candidate.id,
            existingAssertionId: ex.id,
            reason: `关键词对立: ${pair[0]} ↔ ${pair[1]}`,
            candidateClaim: candidate.claimText,
            existingClaim: ex.claimText,
          });
          break;
        }
      }
    }
  }

  return conflicts;
}
