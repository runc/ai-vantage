import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';
import postgres from 'postgres';
import { getDatabaseUrl, getDialect } from './dialect.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runSqlStatements(sqlText: string): string[] {
  return sqlText
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function migratePostgres(url: string) {
  const sql = postgres(url, { max: 1 });
  const dir = path.join(__dirname, '..', 'drizzle');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const migrationSql = fs.readFileSync(path.join(dir, file), 'utf-8');
    await sql.unsafe(migrationSql);
    console.log(`PostgreSQL migration applied: ${file}`);
  }
  await sql.end();
}

async function migrateLibsql(url: string) {
  const filePath = url.replace(/^file:/, '');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const client = createClient({ url });
  const migrationsDir = path.join(__dirname, '..', 'drizzle-sqlite');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    for (const statement of runSqlStatements(migrationSql)) {
      await client.execute(statement);
    }
    console.log(`SQLite/libsql migration applied: ${file}`);
  }
  client.close();
  console.log(`Database ready → ${url}`);
}

async function migrate() {
  const url = getDatabaseUrl();
  const dialect = getDialect(url);

  if (dialect === 'postgres') {
    await migratePostgres(url);
  } else {
    await migrateLibsql(url);
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
