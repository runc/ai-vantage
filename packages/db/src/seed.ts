import { buildSeedFromContent } from '@ai-vantage/kg/seed';
import { getDb, closeDb } from './client.js';
import { EntityRepository } from './repositories/entity-repository.js';
import { RelationRepository } from './repositories/relation-repository.js';
import { getTables } from './schema/index.js';

async function seed() {
  const bundle = buildSeedFromContent();
  const db = getDb();

  const entityRepo = new EntityRepository(db);
  const relationRepo = new RelationRepository(db);

  await entityRepo.upsertMany(bundle.entities);
  await relationRepo.upsertMany(bundle.relations);

  const { ontologyTypes } = getTables();

  for (const onto of bundle.ontologyTypes) {
    await db
      .insert(ontologyTypes)
      .values({
        id: onto.id,
        kind: onto.kind,
        name: onto.name,
        code: onto.code,
        description: onto.description ?? null,
        schema: onto.schema,
        constraints: onto.constraints,
        status: onto.status,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: ontologyTypes.id,
        set: {
          kind: onto.kind,
          name: onto.name,
          code: onto.code,
          description: onto.description ?? null,
          schema: onto.schema,
          constraints: onto.constraints,
          status: onto.status,
          updatedAt: new Date(),
        },
      });
  }

  console.log(
    `Seeded ${bundle.entities.length} entities, ${bundle.relations.length} relations, ${bundle.ontologyTypes.length} ontology types`,
  );
  await closeDb();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
