# M4 迭代规划：AI 候选图谱

> **状态：已完成** — 见 [m4-completion.md](./m4-completion.md)  
> 前置：**M3 已完成**（[m3-completion.md](./m3-completion.md)）  
> 基准：[investment-knowledge-graph-development-plan.md](./investment-knowledge-graph-development-plan.md) 里程碑 M4、§6.5、§8

---

## 一、M4 目标（一句话）

在 M3 审核能力之上，实现 **文档登记 → AI/规则抽取 → 候选 Assertion + Evidence 入库 → 冲突提示**，全部进入 `candidate` 状态，经 `/review/assertions` 审核后才可 `active`。

```text
Document 登记 / 从 MDX 导入
  → POST /documents/:id/ingest
  → 抽取 pipeline（默认 stub，可选 LLM）
  → candidate Assertion + Evidence
  → 冲突检测（对比已有 active）
  → 审核队列
```

**M4 不做**（留给 M5）：

- `/research/*` 完整研究工作台
- `/agent` Agent 页面
- BullMQ/Redis 生产队列（M4 用 API 内联处理 + 可选 CLI worker）
- pgvector 向量检索

---

## 二、里程碑验收

| # | 验收项 | 验证方式 |
|---|--------|----------|
| 1 | 可登记文档并触发 ingest | `POST /documents` + `POST .../ingest` |
| 2 | ingest 产生 `candidate` 断言与证据 | DB + 审核页可见 |
| 3 | 抽取结果可查询 | `GET /documents/:id/extractions` |
| 4 | 与 active 判断冲突可展示 | extraction `conflicts` 字段 |
| 5 | M2/M3 能力不退化 | `pnpm test` 全绿 |

---

## 三、迭代拆分

### M4.1 领域与存储（≈2 天）

- `packages/ai`：抽取类型、stub pipeline、冲突检测
- `document_extractions` 表 + `DocumentRepository` + `ExtractionRepository`
- `packages/contracts`：`documents.ts`

### M4.2 文档 API + Ingest（≈2–3 天）

- `DocumentService`、`IngestService`
- `GET/POST /documents`、`POST /documents/:id/ingest`、`GET .../extractions`
- `POST /documents/from-mdx`（从 `content/` 导入）

### M4.3 Worker（可选 CLI）（≈1 天）

- `apps/worker`：`pnpm worker:ingest <documentId>` 复用同一 pipeline

### M4.4 Web + 种子（≈2 天）

- `/research/documents`：文档列表、触发 ingest、查看抽取与冲突
- `pnpm db:seed:m4-demo`
- 审核页展示冲突标记

### M4.5 测试与文档

- `apps/api/src/m4.test.ts`
- `docs/m4-completion.md`

---

## 四、抽取器策略

| 模式 | 条件 | 行为 |
|------|------|------|
| `stub`（默认） | 无 `OPENAI_API_KEY` | 按句切分 MDX 正文，生成低置信度 candidate |
| `openai`（可选） | 设置 API Key | 调用 LLM 结构化输出（后续增强） |

本地开发零配置即可演示完整审核闭环。

---

## 五、与 M5 边界

| M5 | 依赖 M4 |
|----|---------|
| 领域/主题/标的研究视图 | 文档与候选判断 API |
| Agent 工具 | 图谱 + 证据查询 |
