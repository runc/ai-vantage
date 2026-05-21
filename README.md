# AI Vantage

**AI 原生投资知识图谱平台** — 用结构化知识图谱与 Agent 工具，辅助理解 AI 产业链投资逻辑。

> 核心理念：**「AI 研究 AI 投资」** — 从静态阅读站演进为可探索、可审核、可扩展的投资研究工作台。

[![CI](https://github.com/runc/ai-vantage/actions/workflows/ci.yml/badge.svg)](https://github.com/runc/ai-vantage/actions/workflows/ci.yml)

## 功能概览

| 模块 | 路径 | 说明 |
|------|------|------|
| 电子书 | `/book` | MDX 产业七层架构、标的与概念体系 |
| 知识图谱 | `/graph` | 2D（React Flow）/ 3D 关系探索、路径与邻域查询 |
| 研究 | `/research` | 领域 / 主题 / 标的 / 事件多视角工作台 |
| Agent | `/agent` | 图谱查询、主题分析、简报生成等工具调用 |
| 审核 | `/review/assertions` | 投资判断（断言）的提交与核验流程 |
| 入库 | `/research/documents` | MDX 文档导入与 AI 抽取 pipeline |
| 探索 | `/explore` | 按层级、标的逐层钻取 |
| 版本演变 | `/timeline` | 投资逻辑与内容版本时间线 |

内容种子来自 `content/`（32 实体、70+ 关系），可通过 API 或静态 JSON 驱动前端图谱。

## 技术栈

- **Web**：Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
- **API**：Hono · Zod OpenAPI
- **数据**：Drizzle ORM · libsql/SQLite（本地默认）· 可选 PostgreSQL / Turso
- **图谱**：`@xyflow/react` · `react-force-graph-3d` · ELK 布局
- **Monorepo**：pnpm workspace

## 仓库结构

```text
ai-vantage/
├── apps/
│   ├── api/          # Hono HTTP API (:3001)
│   └── worker/       # 文档 ingest CLI
├── packages/
│   ├── kg/           # 领域模型、MDX 种子、图谱算法
│   ├── contracts/    # API DTO 与 Zod schema
│   ├── db/           # Drizzle schema、迁移、仓储
│   └── ai/           # 文档抽取 pipeline（stub / 可选 LLM）
├── content/          # MDX 层级、标的、概念、relations.json
├── src/              # Next.js 应用
└── docs/             # 里程碑与数据模型文档
```

## 快速开始

### 环境要求

- Node.js 20+
- pnpm 9+
- 无需 Docker（本地默认 SQLite 文件）

### 安装与启动

```bash
git clone https://github.com/runc/ai-vantage.git
cd ai-vantage
pnpm install

cp .env.example .env.local   # 按需修改

pnpm db:setup && pnpm db:migrate && pnpm db:seed
pnpm db:seed:m3-demo         # 审核演示数据
pnpm db:seed:m4-demo         # 文档抽取演示
pnpm db:seed:m5-demo         # 研究工作台演示

pnpm dev:stack               # 并行启动 API :3001 + Web :13000
```

浏览器访问：

- Web：<http://localhost:13000>
- API 健康检查：<http://localhost:3001/health>
- OpenAPI：<http://localhost:3001/openapi>

也可分开启动：`pnpm dev:api` / `pnpm dev`。

### 图谱数据源

| 模式 | 环境变量 | 场景 |
|------|----------|------|
| API | `GRAPH_DATA_SOURCE=api` | 本地全栈开发（读写数据库） |
| 静态 | `GRAPH_DATA_SOURCE=static` | CI 构建、无 API 时预览 |

## 常用命令

```bash
pnpm test              # kg + ai + web + api 全套测试
pnpm build:ci          # 静态图谱模式构建（CI 用）
pnpm lint

pnpm kg:test
pnpm kg:seed:export    # 导出 content → .seed-export/
pnpm worker:ingest     # 批量文档 ingest
```

数据库默认路径：`.local/ai-vantage.db`（不设置 `DATABASE_URL` 时自动使用）。更多配置见 [`.env.example`](.env.example)。

## Workspace 包

| 包名 | 职责 |
|------|------|
| `@ai-vantage/kg` | 实体/关系模型、MDX 种子、探索查询、legacy 适配 |
| `@ai-vantage/contracts` | 跨端 API 类型与校验 |
| `@ai-vantage/db` | 迁移、仓储、审计、种子脚本 |
| `@ai-vantage/api` | REST + OpenAPI 服务 |
| `@ai-vantage/ai` | 文档抽取与冲突检测 |
| `@ai-vantage/worker` | ingest 命令行入口 |

## 文档

| 文档 | 内容 |
|------|------|
| [README-KG.md](README-KG.md) | 本地开发、API 端点、数据库选项 |
| [docs/plan.md](docs/plan.md) | 产品愿景与路线图 |
| [docs/investment-knowledge-graph-development-plan.md](docs/investment-knowledge-graph-development-plan.md) | 知识图谱详细开发计划 |
| [docs/knowledge-graph-data-model.md](docs/knowledge-graph-data-model.md) | 数据模型 |
| [docs/m1-completion.md](docs/m1-completion.md) … [m5-completion.md](docs/m5-completion.md) | 各里程碑交付说明 |

## 里程碑

- **M1** — 图谱 API + 静态/动态双数据源
- **M2** — 实体写入、子图、路径、探索查询
- **M3** — 断言 / 证据 / 审核与审计日志
- **M4** — 文档入库与 AI 抽取
- **M5** — 投资研究工作台 + Agent 工具

## 贡献

欢迎 Issue 与 PR。提交前请运行 `pnpm test`。

## License

暂未指定开源协议；如需二次使用请先与仓库维护者联系。
