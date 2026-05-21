CREATE TABLE IF NOT EXISTS "document_extractions" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "extractor" text DEFAULT 'stub' NOT NULL,
  "result" jsonb,
  "error" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp
);

CREATE INDEX IF NOT EXISTS "document_extractions_doc_idx" ON "document_extractions" ("document_id");
