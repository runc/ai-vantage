# AI Vantage 投资知识图谱开发计划

## 一、目标定位

AI Vantage 当前已经具备 Next.js 前端、MDX 内容、React Flow 图谱和产业链展示基础。下一阶段的目标不是简单增加页面，而是把项目升级为一个以投资知识图谱为核心的数据与研究平台。

核心目标：

- 保留 Next.js 作为 Web 主应用，继续承载内容阅读、图谱展示、研究工作台和 Agent 交互。
- 新增独立 Hono API，承载图谱查询、图谱维护、审核、文档、事件和 Agent 工具接口。
- 新增 Bun/Node Worker，承载 AI 抽取、资讯入库、实体归一、关系生成、置信度刷新和图谱快照。
- 使用 PostgreSQL + pgvector 作为第一阶段统一数据底座，避免过早引入图数据库复杂度。
- 使用 Drizzle 管理数据模型和迁移，使用 Zod/OpenAPI 统一前后端契约。
- 围绕投资研究闭环构建知识图谱，而不是做泛化金融百科。

投资知识图谱主线：

```text
领域 -> 投资主题 -> 产业链 -> 公司 -> 投资标的 -> 事件 -> 证据 -> 投资判断
```

---

## 二、总体技术选型

### 2.1 技术栈

```text
Frontend:
  Next.js 16
  React 19
  TypeScript
  Tailwind CSS 4
  shadcn/ui
  React Flow
  Three.js / react-force-graph-3d

Backend API:
  Hono
  TypeScript
  Zod
  OpenAPI

Worker:
  Bun 或 Node
  TypeScript
  BullMQ
  Redis

Database:
  PostgreSQL
  pgvector
  Drizzle ORM

AI Layer:
  LLM Provider Adapter
  Prompt Templates
  Entity/Relation/Event Extraction Pipeline

Quality:
  Vitest
  Playwright
  ESLint
  TypeScript strict mode
```

### 2.2 为什么保留 Next.js

当前项目已有：

- MDX 电子书内容
- 产业链页面
- 图谱页面
- 时间线页面
- 探索页
- Next.js App Router 结构

Next.js 继续适合承担：

- 内容型页面
- 图谱工作台
- 研究报告阅读
- SSR/SSG 页面
- 未来 Agent Web UI

但后端业务逻辑不建议继续塞进 Next.js Route Handler。图谱 API、AI 抽取和数据维护应从 Web 应用中拆出来，保持边界清晰。

### 2.3 推荐架构

```text
ai-vantage/
  apps/
    web/                # Next.js Web，当前项目逐步迁入
    api/                # Hono API
    worker/             # AI 抽取、图谱刷新、定时任务

  packages/
    kg/                 # 投资知识图谱领域模型
    db/                 # Drizzle schema、migration、repository
    contracts/          # Zod schema、OpenAPI、typed client
    ai/                 # LLM provider、prompt、抽取 pipeline
    config/             # tsconfig、eslint、env schema
    ui/                 # 可选，共享 UI 组件

  docs/
    plan.md
    knowledge-graph-data-model.md
    investment-knowledge-graph-development-plan.md
```

第一阶段可以不立刻迁成完整 monorepo，但代码组织应按上述边界设计。

---

## 三、核心领域模型

### 3.1 最小核心对象

投资知识图谱第一版围绕七个对象展开：

```text
Entity
Relation
Assertion
Evidence
Document
OntologyType
Snapshot
```

含义：

| 对象 | 含义 |
|---|---|
| Entity | 图谱节点，表示领域、主题、公司、标的、技术、产品、事件等 |
| Relation | 图谱边，表示供应、竞争、归属、上下游、影响等关系 |
| Assertion | 可验证的事实、判断或投资逻辑 |
| Evidence | 支撑关系或判断的证据 |
| Document | 新闻、公告、财报、研报、用户上传文档等来源 |
| OntologyType | 实体类型、关系类型、属性和约束定义 |
| Snapshot | 某一时间点的图谱状态 |

### 3.2 第一版实体类型

```text
Domain              领域
Theme               投资主题
Industry            行业
SubIndustry         子行业
SupplyChainStage    产业链环节
Company             公司主体
Instrument          投资标的
Product             产品
Technology          技术
Event               事件
Metric              指标
Document            来源文档
```

第一版暂不优先支持：

```text
Person
Region
Fund
Bond
Derivative
AlternativeAsset
```

### 3.3 第一版关系类型

```text
belongs_to
contains
listed_as
produces
supplies_to
customer_of
competes_with
upstream_of
downstream_of
depends_on
enables
benefits_from
hurt_by
affected_by
mentions
supports
contradicts
changes_metric
```

### 3.4 Assertion 的重要性

投资图谱中很多内容不是稳定事实，而是带时间和证据的判断。

例如：

```text
工业富联 benefits_from AI 服务器需求增长
HBM 供给紧张 supports AI 算力景气逻辑
出口管制 hurt_by 半导体设备出口
云厂商资本开支上调 supports AI 服务器需求增长
```

这些内容都应该进入 `Assertion`，并绑定 `Evidence`。

核心原则：

```text
AI 生成候选判断
证据支撑候选判断
人工或规则审核候选判断
只有 verified / active 判断进入正式图谱
```

---

## 四、工程结构计划

### 4.1 Web 应用

当前 `src/app`、`src/components`、`src/lib` 可先保留。

后续迁移目标：

```text
apps/web/
  src/
    app/
      page.tsx
      graph/
      explore/
      book/
      timeline/
      research/
      review/
      agent/
    components/
      graph/
      explore/
      timeline/
      review/
      agent/
      ui/
    lib/
      api-client.ts
      graph-view-model.ts
      content.ts
```

Web 层职责：

- 展示图谱
- 展示内容
- 提供研究工作台
- 提供审核界面
- 调用 Hono API
- 不直接操作数据库
- 不执行 AI 抽取长任务

### 4.2 API 应用

```text
apps/api/
  src/
    index.ts
    app.ts
    routes/
      graph.ts
      entities.ts
      relations.ts
      assertions.ts
      evidences.ts
      documents.ts
      ontology.ts
      snapshots.ts
      events.ts
      agent-tools.ts
    services/
      graph-service.ts
      entity-service.ts
      assertion-service.ts
      document-service.ts
      ontology-service.ts
      snapshot-service.ts
    middleware/
      error.ts
      logger.ts
      auth.ts
    openapi/
      registry.ts
```

API 层职责：

- 暴露图谱查询接口
- 暴露实体、关系、判断、证据维护接口
- 暴露审核接口
- 暴露文档入库接口
- 暴露 Agent 工具接口
- 校验请求和响应 schema
- 不承载长时间 AI 任务

### 4.3 Worker 应用

```text
apps/worker/
  src/
    index.ts
    queues/
      graph-ingestion.queue.ts
      ai-extraction.queue.ts
      snapshot.queue.ts
    jobs/
      ingest-document.ts
      parse-document.ts
      chunk-document.ts
      extract-entities.ts
      extract-events.ts
      extract-relations.ts
      generate-assertions.ts
      normalize-entities.ts
      refresh-confidence.ts
      detect-conflicts.ts
      build-snapshot.ts
    schedules/
      daily-news-ingestion.ts
      weekly-snapshot.ts
```

Worker 层职责：

- 文档解析
- 文本切分
- AI 抽取
- 实体归一
- 候选关系生成
- 候选判断生成
- 冲突检测
- 置信度刷新
- 图谱快照生成

### 4.4 共享包

```text
packages/kg/
  src/
    entity.ts
    relation.ts
    assertion.ts
    evidence.ts
    document.ts
    ontology.ts
    snapshot.ts
    graph-query.ts
    graph-rules.ts
    confidence.ts

packages/db/
  src/
    schema/
      entities.ts
      relations.ts
      assertions.ts
      evidences.ts
      documents.ts
      ontology-types.ts
      snapshots.ts
      audit-logs.ts
    repositories/
      entity-repository.ts
      relation-repository.ts
      assertion-repository.ts
      graph-repository.ts
    migrations/

packages/contracts/
  src/
    graph.ts
    entities.ts
    assertions.ts
    documents.ts
    ontology.ts
    openapi.ts

packages/ai/
  src/
    providers/
    prompts/
    extractors/
    normalizers/
    evaluators/
```

---

## 五、数据库设计计划

### 5.1 第一版数据表

```text
entities
relations
assertions
evidences
documents
ontology_types
graph_snapshots
audit_logs
```

### 5.2 entities

用途：保存图谱节点。

核心字段：

```text
id
type
name
slug
aliases
description
properties
status
source
created_at
updated_at
```

说明：

- `type` 对应 Domain、Theme、Company、Instrument 等。
- `aliases` 用于实体归一，例如 NVIDIA、英伟达、Nvidia Corporation。
- `properties` 使用 JSONB 保存不同实体类型的扩展字段。
- `status` 用于 candidate、verified、active、deprecated 等状态。

### 5.3 relations

用途：保存实体之间的结构化边。

核心字段：

```text
id
subject_entity_id
predicate
object_entity_id
properties
confidence
status
valid_from
valid_to
created_at
updated_at
```

说明：

- `predicate` 对应 supplies_to、benefits_from、upstream_of 等。
- 关系应有方向。
- 关系可以绑定一个或多个 Assertion/Evidence。

### 5.4 assertions

用途：保存事实、判断和投资逻辑。

核心字段：

```text
id
subject_entity_id
predicate
object_entity_id
claim_text
confidence
status
generated_by
reviewed_by
valid_from
valid_to
created_at
updated_at
```

状态流：

```text
extracted -> candidate -> verified -> active
                         -> rejected
                         -> deprecated
```

### 5.5 evidences

用途：保存支撑图谱信息的证据。

核心字段：

```text
id
document_id
source_type
source_title
source_url
publisher
published_at
evidence_span
page_number
reliability_score
created_at
```

### 5.6 documents

用途：保存来源文档和解析状态。

核心字段：

```text
id
title
source_type
source_url
publisher
published_at
raw_text
content_hash
parse_status
ingestion_status
metadata
created_at
updated_at
```

### 5.7 ontology_types

用途：保存本体定义。

核心字段：

```text
id
kind
name
code
description
schema
constraints
status
created_at
updated_at
```

`kind` 可为：

```text
entity_type
relation_type
attribute_schema
hierarchy_rule
review_policy
```

### 5.8 graph_snapshots

用途：保存某一时间点的图谱状态。

核心字段：

```text
id
name
scope
entity_count
relation_count
assertion_count
snapshot_data
created_by
created_at
```

### 5.9 audit_logs

用途：保存修改历史。

核心字段：

```text
id
actor_type
actor_id
action
target_type
target_id
before
after
reason
created_at
```

---

## 六、API 设计计划

### 6.1 图谱查询

```text
GET /graph
GET /graph/subgraph
GET /graph/search
GET /graph/path
GET /graph/neighbors/:entityId
```

能力：

- 查询完整图谱
- 查询某领域子图
- 查询某主题子图
- 搜索节点
- 查询节点邻居
- 查询两点之间路径

### 6.2 实体接口

```text
GET    /entities
GET    /entities/:id
POST   /entities
PATCH  /entities/:id
POST   /entities/:id/merge
POST   /entities/:id/deprecate
```

能力：

- 创建实体
- 编辑实体
- 合并实体
- 废弃实体
- 查看实体详情

### 6.3 关系接口

```text
GET    /relations
GET    /relations/:id
POST   /relations
PATCH  /relations/:id
POST   /relations/:id/deprecate
```

能力：

- 创建关系
- 编辑关系
- 废弃关系
- 查看证据

### 6.4 判断与审核接口

```text
GET  /assertions
GET  /assertions/:id
POST /assertions/:id/verify
POST /assertions/:id/reject
POST /assertions/:id/deprecate
POST /assertions/:id/link-evidence
```

能力：

- 查看 AI 候选判断
- 审核通过
- 拒绝
- 标记过期
- 绑定证据

### 6.5 文档接口

```text
GET  /documents
GET  /documents/:id
POST /documents
POST /documents/:id/ingest
GET  /documents/:id/extractions
```

能力：

- 上传或登记文档
- 触发入库
- 查看解析结果
- 查看 AI 抽取结果

### 6.6 本体接口

```text
GET    /ontology/types
POST   /ontology/types
PATCH  /ontology/types/:id
POST   /ontology/types/:id/deprecate
```

能力：

- 维护实体类型
- 维护关系类型
- 维护约束和审核策略

### 6.7 Agent 工具接口

```text
POST /agent-tools/query-graph
POST /agent-tools/analyze-theme
POST /agent-tools/analyze-instrument
POST /agent-tools/trace-event-impact
POST /agent-tools/generate-brief
```

这些接口应复用图谱服务，不直接绕过业务层访问数据库。

---

## 七、前端工作台计划

### 7.1 图谱主页

路径建议：

```text
/graph
```

能力：

- 展示领域图谱
- 支持按关系类型过滤
- 支持按实体类型过滤
- 支持 1 跳/2 跳邻居高亮
- 支持查看路径
- 支持切换 2D/3D

### 7.2 领域视图

路径建议：

```text
/research/domains/[slug]
```

能力：

- 展示领域概览
- 展示相关主题
- 展示产业链层级
- 展示核心标的
- 展示最新事件
- 展示关键风险

### 7.3 主题视图

路径建议：

```text
/research/themes/[slug]
```

能力：

- 展示投资主题逻辑
- 展示受益标的
- 展示受损标的
- 展示支撑证据
- 展示反驳证据
- 展示相关事件时间线

### 7.4 标的视图

路径建议：

```text
/research/instruments/[symbol]
```

能力：

- 展示公司和投资标的映射
- 展示上下游关系
- 展示核心投资逻辑
- 展示关键事件
- 展示相关指标
- 展示风险因素

### 7.5 事件视图

路径建议：

```text
/research/events/[id]
```

能力：

- 展示事件摘要
- 展示来源证据
- 展示影响的领域、主题、公司、标的
- 展示事件影响路径

### 7.6 审核队列

路径建议：

```text
/review/assertions
```

能力：

- 查看 AI 候选判断
- 查看原始证据
- 通过
- 拒绝
- 编辑后通过
- 标记冲突
- 标记过期

### 7.7 Agent 页面

路径建议：

```text
/agent
```

能力：

- 自然语言查询图谱
- 调用图谱工具
- 返回图谱片段
- 返回证据
- 返回投资研究摘要

---

## 八、Worker 与 AI 抽取计划

### 8.1 文档入库流程

```text
Document Registered
-> Parse Document
-> Chunk Text
-> Extract Entities
-> Extract Events
-> Extract Relations
-> Generate Assertions
-> Normalize Entities
-> Attach Evidence
-> Detect Conflicts
-> Candidate Queue
```

### 8.2 AI 抽取任务

第一版 AI 任务：

```text
extract_entities
extract_events
extract_relations
generate_assertions
normalize_entities
detect_conflicts
```

暂不优先做：

```text
自动投资评级
自动买卖建议
复杂量化回测
多 Agent 自主交易模拟
```

### 8.3 置信度计算

候选判断的置信度可以由以下维度综合：

```text
confidence =
  model_confidence
  * source_reliability
  * evidence_strength
  * consistency_score
  * freshness_score
```

维度说明：

| 维度 | 说明 |
|---|---|
| model_confidence | 模型抽取信心 |
| source_reliability | 来源可信度 |
| evidence_strength | 原文是否直接支持判断 |
| consistency_score | 是否与已有图谱一致 |
| freshness_score | 信息是否足够新 |

### 8.4 冲突检测

系统允许冲突存在，但必须显式呈现。

示例：

```text
Assertion A:
  claim: HBM 供给仍然紧张
  status: active

Assertion B:
  claim: HBM 供给紧张程度缓解
  status: candidate
  contradicts: Assertion A
```

冲突处理：

- 展示冲突判断
- 对比证据来源
- 提醒人工审核
- 允许旧判断降级为 deprecated

---

## 九、开发阶段规划

### 阶段 0：工程基线整理

目标：

- 保留当前 Next.js 项目正常运行。
- 明确未来 monorepo 边界。
- 不做大规模迁移。

任务：

- 梳理当前 `src/lib` 中图谱相关代码。
- 梳理当前静态图谱数据来源。
- 补充基础 TypeScript 类型。
- 确定 `packages/kg` 的模型边界。

验收：

- 当前页面不受影响。
- 能明确列出现有图谱数据如何映射到新模型。

### 阶段 1：知识图谱领域模型

目标：

- 建立投资知识图谱核心模型。

任务：

- 新建 `packages/kg`。
- 定义 Entity、Relation、Assertion、Evidence、Document、OntologyType、Snapshot。
- 定义实体类型枚举。
- 定义关系类型枚举。
- 定义状态流。
- 实现基础校验规则。
- 将现有图谱数据转换为标准模型的 seed。

验收：

- 前端图谱可以消费标准化图谱数据。
- 现有图谱节点和边能无损映射到新模型。
- 类型定义能被 Web、API、Worker 共享。

### 阶段 2：数据库与迁移

目标：

- 将图谱从静态文件升级为可维护数据。

任务：

- 新建 `packages/db`。
- 配置 Drizzle。
- 设计 PostgreSQL schema。
- 增加 migrations。
- 增加 seed 脚本。
- 支持 pgvector 扩展。
- 建立基础 repository。

验收：

- 可以初始化数据库。
- 可以导入现有图谱 seed。
- 可以查询实体、关系、判断、证据。
- migrations 可重复执行。

### 阶段 3：Hono API

目标：

- 为 Web 和 Agent 提供稳定图谱 API。

任务：

- 新建 `apps/api`。
- 配置 Hono。
- 配置 Zod 请求/响应校验。
- 配置 OpenAPI 文档生成。
- 实现图谱查询接口。
- 实现实体和关系接口。
- 实现 Assertion 审核接口。
- 实现文档入库接口。

验收：

- Web 可以通过 API 获取图谱数据。
- 可以查询节点邻居。
- 可以查询主题子图。
- 可以审核 AI 候选 Assertion。
- OpenAPI 文档可访问。

### 阶段 4：Next.js 图谱工作台改造

目标：

- 把当前静态图谱页面升级为研究工作台。

任务：

- 图谱页面改为从 API 获取数据。
- 增加实体详情面板。
- 增加关系证据面板。
- 增加主题视图。
- 增加标的视图。
- 增加事件视图。
- 增加审核队列页面。

验收：

- 用户可以从领域进入主题、产业链和标的。
- 点击关系可以看到 Assertion 和 Evidence。
- 可以筛选关系类型。
- 可以查看 AI 候选内容。
- 可以审核通过或拒绝候选判断。

### 阶段 5：Worker 与 AI 候选生成

目标：

- 让 AI 能动态生成候选图谱内容。

任务：

- 新建 `apps/worker`。
- 配置 Redis + BullMQ。
- 实现文档解析队列。
- 实现实体抽取任务。
- 实现事件抽取任务。
- 实现关系抽取任务。
- 实现 Assertion 生成任务。
- 实现 Evidence 绑定。
- 实现冲突检测。

验收：

- 上传或登记文档后，系统可以生成候选实体、事件、关系和判断。
- 候选内容不会直接进入 active 图谱。
- 审核队列可以看到 AI 生成结果。
- 每条候选判断都有证据来源。

### 阶段 6：Agent 图谱工具

目标：

- 让 Agent 可以基于图谱回答投资研究问题。

任务：

- 实现 `query_graph` 工具。
- 实现 `analyze_theme` 工具。
- 实现 `analyze_instrument` 工具。
- 实现 `trace_event_impact` 工具。
- 实现 `generate_brief` 工具。
- 在前端 Agent 页面展示图谱片段和证据。

验收：

- Agent 能回答某个主题的受益标的。
- Agent 能解释某个标的的核心逻辑。
- Agent 能追踪某个事件影响了哪些领域、主题和公司。
- Agent 回答中能附带证据来源。

### 阶段 7：质量治理与版本化

目标：

- 让图谱可以长期维护。

任务：

- 实现 graph snapshot。
- 实现 audit log。
- 实现实体合并工作流。
- 实现关系废弃工作流。
- 实现旧判断过期检测。
- 实现来源可信度评分。
- 实现图谱质量报表。

验收：

- 可以回看历史图谱。
- 可以查看某个实体或关系的修改历史。
- 可以追踪 AI 修改和人工修改。
- 可以定位低质量候选内容。

---

## 十、优先级建议

强烈建议按以下顺序推进：

```text
1. packages/kg 领域模型
2. PostgreSQL + Drizzle 图谱表
3. Hono API 查询图谱
4. Next.js 图谱工作台改造
5. Evidence / Assertion 审核机制
6. Worker + AI 候选生成
7. Agent 查询和研究报告
8. Snapshot / Audit / Quality Governance
```

不要优先做：

```text
复杂 Agent 编排
完整 Neo4j 迁移
自动投资评级
自动交易建议
过度复杂的金融本体
```

原因：

- 没有稳定图谱模型，AI 生成的数据会失控。
- 没有 Evidence，图谱可信度无法维护。
- 没有审核流，动态图谱会快速污染正式数据。
- 没有 API 边界，前端、Worker 和 Agent 会互相耦合。

---

## 十一、第一版里程碑

### M1：静态图谱标准化

交付：

- 标准 Entity/Relation 类型
- 当前静态图谱转换为标准 seed
- 前端继续正常展示

### M2：可查询图谱 API

交付：

- PostgreSQL schema
- Drizzle migrations
- Hono graph API
- Web 从 API 读取图谱

### M3：可维护图谱

交付：

- Entity/Relation 管理
- Assertion/Evidence 管理
- 审核队列
- 基础 audit log

### M4：AI 候选图谱

交付：

- Document ingestion
- AI 抽取任务
- 候选 Assertion
- Evidence 绑定
- 冲突检测

### M5：投资研究工作台

交付：

- 领域视图
- 主题视图
- 标的视图
- 事件影响视图
- Agent 图谱查询

---

## 十二、风险与约束

### 12.1 AI 幻觉风险

控制方式：

- AI 只能生成 candidate。
- 重要关系必须绑定 Evidence。
- active 图谱只使用 verified / active 状态。
- 审核队列必须展示原文证据。

### 12.2 本体膨胀风险

控制方式：

- 第一版限制实体类型和关系类型。
- 本体变更必须人工审核。
- 新增关系类型需要说明使用场景。

### 12.3 工程复杂度风险

控制方式：

- 先模块化单体，再 monorepo。
- 先 PostgreSQL，不急于 Neo4j。
- 先 Hono API，不把业务后端塞进 Next.js。
- 先 Worker 队列，不在请求链路执行 AI 长任务。

### 12.4 数据质量风险

控制方式：

- Evidence 必填。
- Source reliability 分级。
- Audit log 全记录。
- 支持 deprecated，不直接物理删除历史判断。

---

## 十三、结论

AI Vantage 的投资知识图谱应该先建设为一个可维护、可追溯、可审核的数据系统，再逐步叠加 AI 动态生成和 Agent 研究能力。

推荐路线：

```text
Next.js Web
+ Hono API
+ Bun/Node Worker
+ PostgreSQL/pgvector
+ Drizzle
+ Zod/OpenAPI
```

推荐建设顺序：

```text
领域模型 -> 数据库 -> API -> 图谱工作台 -> 审核机制 -> AI Worker -> Agent 工具 -> 质量治理
```

第一阶段最重要的不是生成更多内容，而是建立一个稳定的投资知识图谱骨架：

```text
Entity + Relation + Assertion + Evidence
```

只有这四个对象稳定下来，后续的动态图谱、AI 抽取、事件影响分析和 Agent 研究助手才有可靠基础。
