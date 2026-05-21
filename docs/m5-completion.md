# M5 完成说明 — 投资研究工作台

## 交付摘要

| 能力 | 状态 |
|------|------|
| 研究索引 `GET /research` | ✅ |
| 领域视图 `GET /research/domains/:slug` | ✅ |
| 主题视图 `GET /research/themes/:slug` | ✅ |
| 标的视图 `GET /research/instruments/:symbol` | ✅ |
| 事件视图 `GET /research/events/:id` | ✅ |
| Agent 工具 `POST /agent-tools/*` | ✅ |
| Web `/research/*`、`/agent` | ✅ |
| 演示种子 `pnpm db:seed:m5-demo` | ✅ |

## 本地运行

```bash
pnpm dev:stack
pnpm db:seed && pnpm db:seed:m3-demo && pnpm db:seed:m5-demo
```

- 研究工作台：http://localhost:13000/research  
- 领域视图：http://localhost:13000/research/domains/ai-industry  
- 标的视图：http://localhost:13000/research/instruments/nvidia  
- Agent：http://localhost:13000/agent  

API 未启动时，研究页自动回退**静态模式**（MDX 内容）；事件视图需 API + M5 seed。

## 关键路径

- 视图聚合：`packages/kg/src/research/build-view.ts`
- API：`apps/api/src/services/research-service.ts`、`routes/research.ts`、`routes/agent-tools.ts`
- 种子：`packages/db/src/seed-m5.ts`
- 前端：`src/app/research/*`、`src/app/agent/page.tsx`

## 测试

```bash
pnpm --filter @ai-vantage/api test   # 含 m5.test.ts
```

## 后续（M5+）

- Agent 多轮对话与 MCP
- 主题/事件 MDX 与图谱双向同步
- pgvector 证据检索
- BullMQ 异步简报生成
