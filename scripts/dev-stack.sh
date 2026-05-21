#!/usr/bin/env bash
# Start Hono API + Next.js web (root is not in pnpm workspace packages).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cleanup() {
  trap - INT TERM EXIT
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM EXIT

echo "==> Starting API (http://localhost:3001)"
pnpm dev:api &
API_PID=$!

echo "==> Starting Web (http://localhost:13000)"
pnpm dev
