import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import {
  getDb,
  GraphRepository,
  EntityRepository,
  RelationRepository,
  AssertionRepository,
  EvidenceRepository,
  AuditLogRepository,
  AuditService,
} from '@ai-vantage/db';
import { GraphService } from './services/graph-service.js';
import { EntityService } from './services/entity-service.js';
import { RelationService } from './services/relation-service.js';
import { AssertionService } from './services/assertion-service.js';
import { EvidenceService } from './services/evidence-service.js';
import { createGraphRoutes } from './routes/graph.js';
import { createEntityRoutes } from './routes/entities.js';
import { createRelationRoutes } from './routes/relations.js';
import { createAssertionRoutes } from './routes/assertions.js';
import { createEvidenceRoutes } from './routes/evidences.js';
import { createAuditLogRoutes } from './routes/audit-logs.js';
import { DocumentService } from './services/document-service.js';
import { IngestService } from './services/ingest-service.js';
import { createDocumentRoutes } from './routes/documents.js';
import { ResearchService } from './services/research-service.js';
import { createResearchRoutes } from './routes/research.js';
import { createAgentToolsRoutes } from './routes/agent-tools.js';
import {
  DocumentRepository,
  ExtractionRepository,
} from '@ai-vantage/db';

export function createApp() {
  const app = new OpenAPIHono();

  app.use(
    '*',
    cors({
      origin: ['http://localhost:13000', 'http://127.0.0.1:13000'],
      allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Actor-Id'],
    }),
  );

  const db = getDb();
  const audit = new AuditService(new AuditLogRepository(db));
  const entityRepo = new EntityRepository(db);
  const relationRepo = new RelationRepository(db);
  const assertionRepo = new AssertionRepository(db);
  const evidenceRepo = new EvidenceRepository(db);

  const graphRepo = new GraphRepository(db);
  const graphService = new GraphService(graphRepo);
  const researchService = new ResearchService(
    entityRepo,
    relationRepo,
    assertionRepo,
    graphRepo,
    graphService,
  );
  const entityService = new EntityService(entityRepo, audit);
  const relationService = new RelationService(relationRepo, audit);
  const assertionService = new AssertionService(
    assertionRepo,
    entityRepo,
    evidenceRepo,
    audit,
  );
  const evidenceService = new EvidenceService(evidenceRepo, audit);
  const documentRepo = new DocumentRepository(db);
  const extractionRepo = new ExtractionRepository(db);
  const documentService = new DocumentService(documentRepo, audit);
  const ingestService = new IngestService(db, audit);

  app.route('/graph', createGraphRoutes(graphService));
  app.route('/entities', createEntityRoutes(entityService, assertionService));
  app.route('/relations', createRelationRoutes(relationService));
  app.route('/assertions', createAssertionRoutes(assertionService));
  app.route('/evidences', createEvidenceRoutes(evidenceService));
  app.route('/audit-logs', createAuditLogRoutes(new AuditLogRepository(db)));
  app.route('/documents', createDocumentRoutes(documentService, ingestService));
  app.route('/research', createResearchRoutes(researchService));
  app.route('/agent-tools', createAgentToolsRoutes(researchService));

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.doc('/openapi', {
    openapi: '3.1.0',
    info: {
      title: 'AI Vantage Knowledge Graph API',
      version: '0.5.0',
    },
  });

  app.get('/doc', (c) => c.redirect('/openapi'));

  return app;
}
