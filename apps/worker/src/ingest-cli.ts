/**
 * CLI: pnpm worker:ingest <documentId>
 * Calls POST /documents/:id/ingest on the running API (or API_URL).
 */
const documentId = process.argv[2];
if (!documentId) {
  console.error('Usage: pnpm worker:ingest <documentId>');
  process.exit(1);
}

const base = process.env.API_URL ?? 'http://localhost:3001';

async function main() {
  const res = await fetch(`${base}/documents/${documentId}/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Actor-Id': 'worker-cli',
    },
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(body);
    process.exit(1);
  }
  console.log(JSON.stringify(body, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
