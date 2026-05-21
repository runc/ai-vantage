# M1 完成说明：静态图谱标准化

里程碑 **M1** 对照 [investment-knowledge-graph-development-plan.md](./investment-knowledge-graph-development-plan.md) §十一。

## 交付清单

| 项 | 实现位置 |
|----|----------|
| 标准 Entity / Relation 模型 | [`packages/kg`](../packages/kg) |
| 静态数据 → seed | [`packages/kg/src/seed/build-seed.ts`](../packages/kg/src/seed/build-seed.ts) |
| 映射文档 | [`legacy-graph-mapping.md`](./legacy-graph-mapping.md) |
| Web 消费标准化数据 | [`src/lib/kg-graph.ts`](../src/lib/kg-graph.ts) → [`graph-data.ts`](../src/lib/graph-data.ts) |
| 与 relations.json 无损一致 | [`kg-graph.test.ts`](../src/lib/kg-graph.test.ts)、[`parity.test.ts`](../packages/kg/src/seed/parity.test.ts) |

## 数据流（静态模式）

```text
content/graph/relations.json + MDX frontmatter
  → buildSeedFromContent()     [@ai-vantage/kg]
  → Entity[] + Relation[]
  → standardToLegacyGraph()      [adapter]
  → ViewNode[] + ViewEdge[]      [Web]
  → getReactFlowData()           [+ MDX 详情 enrich]
```

## 与 API 模式关系

- **M1 静态**：`GRAPH_DATA_SOURCE=static`（或未设置）→ 走 `kg-graph`
- **M2 API**：`GRAPH_DATA_SOURCE=api` → `fetchGraphFromApi()`，失败回退 M1 路径

图谱页标题栏会显示数据源：`KG 标准化 · 静态` 或 `API · SQLite`。

## 验证

```bash
pnpm kg:test
pnpm test:web
```
