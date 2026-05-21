#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { buildSeedFromContent } from './build-seed';
import { standardToLegacyGraph } from '../adapters/legacy-graph';
import { resolveContentDir } from './load-content';

const outDir = process.argv[2] ?? path.join(resolveContentDir(), '..', '.seed-export');
const seed = buildSeedFromContent();

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'entities.json'),
  JSON.stringify(seed.entities, null, 2),
);
fs.writeFileSync(
  path.join(outDir, 'relations.json'),
  JSON.stringify(seed.relations, null, 2),
);
fs.writeFileSync(
  path.join(outDir, 'legacy-graph.json'),
  JSON.stringify(standardToLegacyGraph(seed.entities, seed.relations), null, 2),
);

console.log(`Exported ${seed.entities.length} entities, ${seed.relations.length} relations → ${outDir}`);
