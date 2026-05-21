import { defineConfig } from 'drizzle-kit';
import { getDatabaseUrl, getDialect } from './src/dialect.ts';

const dialect = getDialect(getDatabaseUrl());

export default defineConfig({
  schema:
    dialect === 'postgres'
      ? './src/schema/pg/index.ts'
      : './src/schema/sqlite/index.ts',
  out: dialect === 'postgres' ? './drizzle' : './drizzle-sqlite',
  dialect: dialect === 'postgres' ? 'postgresql' : 'sqlite',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
