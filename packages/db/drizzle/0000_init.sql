-- pgvector is optional (reserved for future embeddings). Install via Homebrew if needed:
--   brew install pgvector
DO $pgvector$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available — skipping (OK for M2 graph API)';
END
$pgvector$;

CREATE TABLE IF NOT EXISTS "entities" (
  "id" text PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "description" text,
  "properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "source" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "entities_type_idx" ON "entities" ("type");
CREATE INDEX IF NOT EXISTS "entities_slug_idx" ON "entities" ("slug");
CREATE INDEX IF NOT EXISTS "entities_status_idx" ON "entities" ("status");

CREATE TABLE IF NOT EXISTS "relations" (
  "id" text PRIMARY KEY NOT NULL,
  "subject_entity_id" text NOT NULL,
  "predicate" text NOT NULL,
  "object_entity_id" text NOT NULL,
  "properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "confidence" real DEFAULT 1 NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "label" text,
  "valid_from" timestamp with time zone,
  "valid_to" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "relations_subject_idx" ON "relations" ("subject_entity_id");
CREATE INDEX IF NOT EXISTS "relations_object_idx" ON "relations" ("object_entity_id");
CREATE INDEX IF NOT EXISTS "relations_predicate_idx" ON "relations" ("predicate");
CREATE INDEX IF NOT EXISTS "relations_status_idx" ON "relations" ("status");

CREATE TABLE IF NOT EXISTS "assertions" (
  "id" text PRIMARY KEY NOT NULL,
  "subject_entity_id" text NOT NULL,
  "predicate" text NOT NULL,
  "object_entity_id" text,
  "claim_text" text NOT NULL,
  "confidence" real DEFAULT 0.5 NOT NULL,
  "status" text DEFAULT 'candidate' NOT NULL,
  "evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "generated_by" text,
  "reviewed_by" text,
  "valid_from" timestamp with time zone,
  "valid_to" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "assertions_status_idx" ON "assertions" ("status");

CREATE TABLE IF NOT EXISTS "evidences" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text,
  "source_type" text NOT NULL,
  "source_title" text NOT NULL,
  "source_url" text,
  "publisher" text,
  "published_at" timestamp with time zone,
  "evidence_span" text,
  "page_number" integer,
  "reliability_score" real DEFAULT 0.5 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "source_type" text NOT NULL,
  "source_url" text,
  "publisher" text,
  "published_at" timestamp with time zone,
  "raw_text" text,
  "content_hash" text,
  "parse_status" text DEFAULT 'pending' NOT NULL,
  "ingestion_status" text DEFAULT 'registered' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ontology_types" (
  "id" text PRIMARY KEY NOT NULL,
  "kind" text NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL,
  "description" text,
  "schema" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "constraints" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "graph_snapshots" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "scope" text,
  "entity_count" integer DEFAULT 0 NOT NULL,
  "relation_count" integer DEFAULT 0 NOT NULL,
  "assertion_count" integer DEFAULT 0 NOT NULL,
  "snapshot_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "actor_type" text NOT NULL,
  "actor_id" text,
  "action" text NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "before" jsonb,
  "after" jsonb,
  "reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_logs_target_idx" ON "audit_logs" ("target_type", "target_id");
