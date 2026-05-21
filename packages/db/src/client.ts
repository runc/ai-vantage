import fs from 'fs';
import path from 'path';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient, type Client as LibsqlClient } from '@libsql/client';
import postgres from 'postgres';
import { getDatabaseUrl, getDialect, type DbDialect } from './dialect.js';
import * as pgSchema from './schema/pg/index.js';
import * as sqliteSchema from './schema/sqlite/index.js';

let pgSql: ReturnType<typeof postgres> | null = null;
let libsqlClient: LibsqlClient | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
let activeDialect: DbDialect | null = null;

function ensureLocalDir(url: string) {
  if (!url.startsWith('file:')) return;
  const filePath = url.replace(/^file:/, '');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createDb(connectionString?: string) {
  const url = connectionString ?? getDatabaseUrl();
  const dialect = getDialect(url);

  if (dialect === 'postgres') {
    const sql = postgres(url, { max: 10 });
    const instance = drizzlePg(sql, { schema: pgSchema });
    return { db: instance, sql, dialect, client: sql };
  }

  ensureLocalDir(url);
  const client = createClient({ url });
  const instance = drizzleLibsql(client, { schema: sqliteSchema });
  return { db: instance, sql: null, dialect, client };
}

export function getDb() {
  const url = getDatabaseUrl();
  const dialect = getDialect(url);

  if (!db || activeDialect !== dialect) {
    const created = createDb(url);
    db = created.db;
    activeDialect = dialect;
    if (dialect === 'postgres') {
      pgSql = created.client as ReturnType<typeof postgres>;
      libsqlClient = null;
    } else {
      libsqlClient = created.client as LibsqlClient;
      pgSql = null;
    }
  }
  return db;
}

export async function closeDb() {
  if (pgSql) {
    await pgSql.end();
    pgSql = null;
  }
  if (libsqlClient) {
    libsqlClient.close();
    libsqlClient = null;
  }
  db = null;
  activeDialect = null;
}

/** Reset singleton (tests / scripts only). */
export function resetDb() {
  db = null;
  activeDialect = null;
  pgSql = null;
  libsqlClient = null;
}

export type Database = ReturnType<typeof getDb>;

export { getDatabaseUrl, getDialect };
