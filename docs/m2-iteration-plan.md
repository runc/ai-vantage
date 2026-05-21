# M2 迭代规划：可查询图谱 API

> **状态：M2 已完成（2026-05）**  
> 前置：**M1 已完成**（见 [m1-completion.md](./m1-completion.md)）  
> 基准：[investment-knowledge-graph-development-plan.md](./investment-knowledge-graph-development-plan.md) 阶段 2–3、里程碑 M2

## M1 完成状态（摘要）

| 交付项 | 状态 |
|--------|------|
| `@ai-vantage/kg` 七对象 + 枚举 + 校验 | ✅ |
| `relations.json` + MDX → 标准 seed | ✅ |
| Web 静态路径经 kg 标准化（`src/lib/kg-graph.ts`） | ✅ |
| 详情叙事仍来自 MDX | ✅ |
| 32 节点 / 71 边无损 | ✅ 单测 |

---

## M2 目标

**图谱结构默认从 Hono API 读取**，本地 SQLite（libsql）为数据源；静态 kg 路径仅作 API 不可用时的 fallback。开发与 CI 不依赖 Docker / PostgreSQL。

```text
/graph (Next SSR)
  → GET /graph (Hono)
  → GraphRepository
  → .local/ai-vantage.db
```

---

## 现状 vs M2 差距

| M2 交付项 | 状态 |
|-----------|------|
| 数据库 schema + migrate + seed | ✅ libsql/SQLite + 可选 Postgres |
| Hono 图谱查询 API | ✅ `/graph` 等 5 个读接口 |
| OpenAPI | ✅ `/openapi` |
| Web 从 API 读图谱 | ✅ `.env.development` 默认 `api` + fallback |
| 路径与 API 对齐 | ✅ `fetchGraphPathClient` + API 单测 |
| 构建不依赖 DB | ✅ `pnpm build:ci`（`GRAPH_DATA_SOURCE=static`） |
| CI | ✅ `.github/workflows/ci.yml` |

---

## 迭代拆分（建议 2 周）

### M2.1 开发体验与默认数据源（2–3 天）

**目标**：本地一键启动即可用 API 图谱。

| 任务 | 产出 |
|------|------|
| `.env.development` 默认 `GRAPH_DATA_SOURCE=api` | 开发环境默认走 API |
| `pnpm dev:stack` | 并行 `dev:api` + `dev`（或 `concurrently`） |
| README / README-KG 更新「推荐启动方式」 | 文档 |
| `/graph` 页展示数据源 + API 健康状态 | 已部分有 label，补 health 探测 |

**验收**：

- 新克隆仓库：`db:setup` → `db:migrate` → `db:seed` → `dev:stack` → `/graph` 显示「API · SQLite」
- 停 API 后页面自动 fallback 并提示

---

### M2.2 API 契约与图谱查询对齐（2–3 天）

**目标**：前端交互与 API 查询一致，不仅首屏全图。

| 任务 | 产出 |
|------|------|
| 路径发现可选走 `GET /graph/path` | `api-client` + `path-finder` 开关 |
| 子图/搜索 API 联调（按需） | 大图聚焦某节点时用 `/subgraph` |
| `next: { revalidate }` 策略文档化 | 开发 0、生产 60s 等 |
| API 集成测试（Vitest + app.request） | `apps/api/src/graph.test.ts` |

**验收**：

- API 模式下路径结果与静态算法结果一致（抽样 3 组节点对）
- OpenAPI 与 `@ai-vantage/contracts` schema 一致

---

### M2.3 构建与质量（1–2 天）

| 任务 | 产出 |
|------|------|
| CI：`kg:test` + `db` seed test + `test:web` | GitHub Actions 或本地脚本 |
| CI build 保持 `GRAPH_DATA_SOURCE=static` | 无 DB 可 build |
| 可选：Playwright `/graph` 冒烟 | 加载 + 筛选 |

**验收**：

- `pnpm test` 全绿
- `pnpm build` 无 DATABASE_URL 可通过

---

## 明确不在 M2 范围（归 M3+）

- Entity/Relation CRUD、`POST /entities`
- Assertion/Evidence 审核、`/review/assertions`
- Worker、AI 抽取、Agent tools
- 研究工作台 `/research/*`
- SeekDB / pgvector 向量检索

---

## 环境变量约定（M2）

```env
# 开发推荐（.env.development）
GRAPH_DATA_SOURCE=api
NEXT_PUBLIC_API_URL=http://localhost:3001

# API + DB（默认 libsql 文件，无需 Docker）
DATABASE_URL=file:.local/ai-vantage.db
API_PORT=3001

# CI / 无 API 构建
GRAPH_DATA_SOURCE=static
```

---

## 成功标准（M2 完成定义）

1. 开发默认 `GRAPH_DATA_SOURCE=api`，`/graph` 数据来自 Hono + SQLite。
2. API 不可用时自动 fallback 至 M1 kg 静态路径，页面仍可用。
3. `GET /graph`、path、neighbors 与前端核心交互对齐。
4. 文档与脚本支持「无 Docker、无 Postgres」本地全流程。
5. 单测覆盖 seed parity、API graph 响应结构。

---

## 建议执行顺序

```text
M2.1 dev:stack + 默认 api
  → M2.2 path API + 集成测试
  → M2.3 CI + 文档收尾
  → 进入 M3（可维护图谱 + 审核队列）
```
