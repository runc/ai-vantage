# Investment Knowledge Graph — Local Development

## Prerequisites

- Node.js 20+
- pnpm 9+
- **No Docker required**

## Default database: libsql / SQLite (local file)

本地开发默认使用项目根目录下的 SQLite 文件（通过 [libsql](https://github.com/tursodatabase/libsql) 驱动），零安装、零配置：

```text
.local/ai-vantage.db
```

不设置 `DATABASE_URL` 时自动使用该路径。

### 可选：远程 libsql（Turso）

```env
DATABASE_URL=libsql://your-db.turso.io
LIBSQL_AUTH_TOKEN=your-token
```

### 可选：PostgreSQL

需要自行安装 PostgreSQL，并设置：

```env
DATABASE_URL=postgresql://ai_vantage:ai_vantage@localhost:5432/ai_vantage
```

### 关于 SeekDB

[SeekDB](https://www.seekdb.ai/) 是 AI 原生检索数据库（向量/全文/混合检索），与当前 Drizzle 关系型图谱表结构不同，**M2 未接入**。本地开发请用 SQLite/libsql；若未来需要向量检索，可再评估 SeekDB 或 pgvector。

## M1 / M2

- **M1 已完成**：[docs/m1-completion.md](docs/m1-completion.md)
- **M2 已完成**：[docs/m2-completion.md](docs/m2-completion.md) · [迭代规划](docs/m2-iteration-plan.md)
- **M3 已完成**：[docs/m3-completion.md](docs/m3-completion.md) · [迭代规划](docs/m3-iteration-plan.md)
- **M4 已完成**：[docs/m4-completion.md](docs/m4-completion.md) · [迭代规划](docs/m4-iteration-plan.md)

## Quick start

```bash
pnpm install
pnpm db:setup && pnpm db:migrate && pnpm db:seed
pnpm db:seed:m3-demo   # M3 演示断言（审核页）
pnpm db:seed:m4-demo   # M4 文档 + openai 抽取演示

pnpm dev:stack     # 并行启动 API :3001 + Web :13000
# 或分开两个终端：pnpm dev:api / pnpm dev
```

`.env.development` 已设 `GRAPH_DATA_SOURCE=api`。CI / 无 API 构建用 `GRAPH_DATA_SOURCE=static`。

## Workspace packages

| Package | Description |
|---------|-------------|
| `@ai-vantage/kg` | Domain model, seed builder, legacy adapters |
| `@ai-vantage/contracts` | API DTOs and Zod schemas |
| `@ai-vantage/db` | Drizzle + libsql/SQLite（默认）或 PostgreSQL |
| `@ai-vantage/api` | Hono HTTP API |
| `@ai-vantage/ai` | 抽取 pipeline（stub / 可选 LLM） |
| `@ai-vantage/worker` | 可选 CLI：`pnpm worker:ingest` |

## API endpoints

**只读（M2）**

- `GET /health`, `/graph`, `/graph/subgraph`, `/graph/search`, `/graph/path`, `/graph/neighbors/:entityId`, `/graph/explore?q=`（可选 `llm=true`，需 API 配置 `OPENAI_API_KEY`）
- `GET /assertions?entityIds=id1,id2`（探索侧栏批量加载判断）

**研究工作台（M5）**

- `GET /research`、`/research/domains/:slug`、`/research/themes/:slug`、`/research/instruments/:symbol`、`/research/events/:id`
- `POST /agent-tools/query-graph`、`analyze-theme`、`analyze-instrument`、`trace-event-impact`、`generate-brief`
- `GET /openapi`

**写入与审核（M3）** — 写请求需 `X-Actor-Id`

- `GET/POST/PATCH /entities`, `POST /entities/:id/deprecate`, `GET /entities/:id/assertions`
- `GET/POST/PATCH /relations`, `POST /relations/:id/deprecate`
- `GET/POST/PATCH /assertions`, `POST /assertions/:id/verify|reject|deprecate|link-evidence`
- `GET/POST /evidences`, `GET /audit-logs`

**文档与 AI 抽取（M4）**

- `GET/POST /documents`, `POST /documents/from-mdx`, `POST /documents/:id/ingest`
- `GET /documents/:id/extractions`

## Scripts

```bash
pnpm db:setup        # mkdir .local
pnpm db:migrate      # SQLite 或 PostgreSQL（由 DATABASE_URL 决定）
pnpm db:seed
pnpm db:seed:m3-demo
pnpm db:seed:m5-demo   # 领域 + 事件演示
pnpm kg:test
pnpm dev:api
```

## Mapping

See [docs/legacy-graph-mapping.md](docs/legacy-graph-mapping.md).
