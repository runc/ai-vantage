# M2 完成说明：可查询图谱 API

## 交付清单

| 项 | 位置 |
|----|------|
| libsql/SQLite 本地库 | `packages/db`、`.local/ai-vantage.db` |
| Hono 图谱 API | `apps/api` |
| 开发默认 API 数据源 | `.env.development` |
| 一键启动 | `pnpm dev:stack` |
| 图谱加载 + fallback | `src/lib/graph-meta.ts` |
| 路径发现走 API | `fetchGraphPathClient` + `useApiPaths` |
| API 集成测试 | `apps/api/src/graph.test.ts` |
| CI | `.github/workflows/ci.yml` |

## 本地启动

```bash
pnpm db:setup && pnpm db:migrate && pnpm db:seed
pnpm dev:stack
```

访问 `/graph`，标题应显示 **API · SQLite**。停止 API 后刷新，应显示 **KG 标准化 · API 不可用**（琥珀色提示）。

## 环境变量

| 变量 | 开发 | CI / build |
|------|------|------------|
| `GRAPH_DATA_SOURCE` | `api`（`.env.development`） | `static`（`build:ci`） |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | — |
| `DATABASE_URL` | 默认 `file:.local/ai-vantage.db` | 同左（测试用） |

## 验证

```bash
pnpm test          # kg + web + api（含 path parity）
pnpm build:ci      # 无 API 也可构建
```

## 下一步（M3）

见 [m3-iteration-plan.md](./m3-iteration-plan.md)（可维护图谱、Assertion 审核、audit log）。
