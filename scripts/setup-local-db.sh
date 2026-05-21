#!/usr/bin/env bash
# Prepare local libsql/SQLite database directory (no Docker, no PostgreSQL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "${ROOT}/.local"

echo "==> Local SQLite directory ready: ${ROOT}/.local/"
echo ""
echo "Default DATABASE_URL (libsql file):"
echo "  file:${ROOT}/.local/ai-vantage.db"
echo ""
echo "Next:"
echo "  pnpm db:migrate"
echo "  pnpm db:seed"
echo "  pnpm dev:api"
echo ""
echo "Optional PostgreSQL instead:"
echo "  DATABASE_URL=postgresql://ai_vantage:ai_vantage@localhost:5432/ai_vantage pnpm db:migrate"
