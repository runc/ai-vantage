import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Database dialect for @ai-vantage/db.
 * Default: libsql (SQLite file) for local dev — no PostgreSQL install required.
 */
export type DbDialect = 'libsql' | 'postgres';

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return getDefaultLibsqlUrl();
}

export function getDialect(url: string = getDatabaseUrl()): DbDialect {
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgres';
  }
  return 'libsql';
}

/** Repo-root SQLite file used when DATABASE_URL is unset */
export function getDefaultLibsqlUrl(): string {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );
  return `file:${path.join(root, '.local', 'ai-vantage.db')}`;
}
