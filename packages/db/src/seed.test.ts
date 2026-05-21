import { describe, it, expect } from 'vitest';
import { buildSeedFromContent } from '@ai-vantage/kg/seed';

describe('buildSeedFromContent', () => {
  it('produces 32 entities and 71 relations', () => {
    const seed = buildSeedFromContent();
    expect(seed.entities).toHaveLength(32);
    expect(seed.relations).toHaveLength(71);
  });
});
