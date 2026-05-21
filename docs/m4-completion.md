# M4 完成说明：AI 候选图谱

> 状态：**已完成**（2026-05-20）  
> 前置：[m3-completion.md](./m3-completion.md)

## 交付摘要

| 能力 | 说明 |
|------|------|
| `@ai-vantage/ai` | stub 抽取 pipeline、MDX 加载、关键词冲突检测 |
| 文档 API | `GET/POST /documents`、`POST /from-mdx`、`POST /:id/ingest`、`GET /:id/extractions` |
| `document_extractions` 表 | 记录每次抽取任务与冲突结果 |
| 候选入库 | 抽取结果均为 `candidate` Assertion + Evidence |
| Web `/research/documents` | MDX 导入、触发抽取、查看冲突 |
| Worker CLI | `pnpm worker:ingest <documentId>`（调用 HTTP API） |

## 抽取模式

- 默认 **stub**：按句切分 MDX 正文，无需 `OPENAI_API_KEY`
- 设置 `OPENAI_API_KEY` 后标记为 `openai` 模式（当前仍回退 stub，LLM 结构化输出留待增强）

## 本地开发

```bash
pnpm db:migrate
pnpm db:seed && pnpm db:seed:m3-demo && pnpm db:seed:m4-demo
pnpm dev:stack
```

- 文档入库：http://localhost:13000/research/documents  
- 审核队列：http://localhost:13000/review/assertions  

## 测试

```bash
pnpm test   # 含 @ai-vantage/ai 与 apps/api m4.test.ts
```

## 未纳入 M4（M5）

- `/research/domains` 等研究工作台视图
- `/agent` 工具接口
- BullMQ / Redis 队列
- pgvector 检索
