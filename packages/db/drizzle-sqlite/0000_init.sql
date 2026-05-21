CREATE TABLE IF NOT EXISTS "entities" (
  "id" text PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "aliases" text DEFAULT '[]' NOT NULL,
  "description" text,
  "properties" text DEFAULT '{}' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "source" text,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "entities_type_idx" ON "entities" ("type");
CREATE INDEX IF NOT EXISTS "entities_slug_idx" ON "entities" ("slug");
CREATE INDEX IF NOT EXISTS "entities_status_idx" ON "entities" ("status");

CREATE TABLE IF NOT EXISTS "relations" (
  "id" text PRIMARY KEY NOT NULL,
  "subject_entity_id" text NOT NULL,
  "predicate" text NOT NULL,
  "object_entity_id" text NOT NULL,
  "properties" text DEFAULT '{}' NOT NULL,
  "confidence" real DEFAULT 1 NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "label" text,
  "valid_from" integer,
  "valid_to" integer,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
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
  "evidence_ids" text DEFAULT '[]' NOT NULL,
  "generated_by" text,
  "reviewed_by" text,
  "valid_from" integer,
  "valid_to" integer,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "assertions_status_idx" ON "assertions" ("status");

CREATE TABLE IF NOT EXISTS "evidences" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text,
  "source_type" text NOT NULL,
  "source_title" text NOT NULL,
  "source_url" text,
  "publisher" text,
  "published_at" integer,
  "evidence_span" text,
  "page_number" integer,
  "reliability_score" real DEFAULT 0.5 NOT NULL,
  "created_at" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "source_type" text NOT NULL,
  "source_url" text,
  "publisher" text,
  "published_at" integer,
  "raw_text" text,
  "content_hash" text,
  "parse_status" text DEFAULT 'pending' NOT NULL,
  "ingestion_status" text DEFAULT 'registered' NOT NULL,
  "metadata" text DEFAULT '{}' NOT NULL,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "ontology_types" (
  "id" text PRIMARY KEY NOT NULL,
  "kind" text NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL,
  "description" text,
  "schema" text DEFAULT '{}' NOT NULL,
  "constraints" text DEFAULT '{}' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "graph_snapshots" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "scope" text,
  "entity_count" integer DEFAULT 0 NOT NULL,
  "relation_count" integer DEFAULT 0 NOT NULL,
  "assertion_count" integer DEFAULT 0 NOT NULL,
  "snapshot_data" text DEFAULT '{}' NOT NULL,
  "created_by" text,
  "created_at" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "actor_type" text NOT NULL,
  "actor_id" text,
  "action" text NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "before" text,
  "after" text,
  "reason" text,
  "created_at" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_logs_target_idx" ON "audit_logs" ("target_type", "target_id");
