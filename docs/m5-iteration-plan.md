# M5 迭代计划 — 投资研究工作台

## 目标

在 M3（审核写入）与 M4（文档抽取）之上，提供**结构化研究视图**与 **Agent 图谱工具**，承接 NL 探索（`/graph`）与 MDX 阅读（`/explore`）。

## 交付范围（M5-MVP）

| 模块 | 路径 / API | 说明 |
|------|------------|------|
| 研究索引 | `GET /research` | 领域 / 主题 / 标的 / 事件列表 |
| 领域视图 | `GET /research/domains/:slug` | 层级、标的、主题、事件、判断 |
| 主题视图 | `GET /research/themes/:slug` | 逻辑、受益/受损、证据、相关标的 |
| 标的视图 | `GET /research/instruments/:symbol` | 公司=标的（symbol 即 entity id/slug） |
| 事件视图 | `GET /research/events/:id` | 摘要、影响路径、关联实体 |
| Agent 工具 | `POST /agent-tools/*` | 复用 explore + research 聚合 |
| Agent UI | `/agent` | 自然语言查图谱 + 工具调用 |
| 演示数据 | `pnpm db:seed:m5-demo` | Domain + Event + 关系 |

## 明确不做（M5 后）

- BullMQ / Redis 长队列
- pgvector 语义检索
- 完整多轮 Agent 编排与 MCP
- 自动买卖建议 / 回测

## 执行顺序

```text
M5.1 contracts + kg/research + entity findBySlug/type
  → M5.2 ResearchService + routes + seed-m5 + agent-tools
  → M5.3 Web /research/* + /agent + navigation
  → M5.4 tests + m5-completion.md + README-KG
```

## 成功标准

1. `GET /research/domains/ai-industry` 返回 7 层 + 核心标的 + 主题列表。  
2. `GET /research/themes/moat-types` 含 active/candidate 判断与关联标的。  
3. `GET /research/instruments/nvidia` 含 1-hop 邻居与判断。  
4. `POST /agent-tools/query-graph` 与 `/graph/explore` 结果一致。  
5. Web 在 `dev:stack` 下可打开研究工作台与 Agent 页。
