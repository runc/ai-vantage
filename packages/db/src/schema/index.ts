import { getDialect } from '../dialect.js';
import * as pgSchema from './pg/index.js';
import * as sqliteSchema from './sqlite/index.js';

export function getSchema() {
  return getDialect() === 'postgres' ? pgSchema : sqliteSchema;
}

/** Active schema tables for the configured DATABASE_URL */
export function getTables() {
  const schema = getSchema();
  return {
    entities: schema.entities,
    relations: schema.relations,
    assertions: schema.assertions,
    evidences: schema.evidences,
    documents: schema.documents,
    ontologyTypes: schema.ontologyTypes,
    graphSnapshots: schema.graphSnapshots,
    auditLogs: schema.auditLogs,
    documentExtractions: schema.documentExtractions,
  };
}

export type SchemaModule = typeof pgSchema | typeof sqliteSchema;
