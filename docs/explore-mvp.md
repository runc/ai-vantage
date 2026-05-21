# 自然语言图谱探索 MVP

> 对齐产品目标 1：投资图谱 + NL 多视图探索（广度与深度）

## 使用方式

1. 打开 http://localhost:13000/graph  
2. 顶部输入框或快捷标签，例如：
   - `英伟达 上下游` — 供应链相关 2 跳子图
   - `英伟达 上游 2跳` — 扩大跳数
   - `OpenAI 到 Google` — 路径模式并高亮
   - `AI产业链` — 展示各投资层及所属标的

## API

```http
GET /graph/explore?q=英伟达+上下游
```

返回：`parse`（意图解析）、`graph`（子图）、`nodeIds`、`paths`（路径模式时）。

## 实现位置

| 模块 | 路径 |
|------|------|
| 解析与执行 | `packages/kg/src/explore/` |
| API | `GET /graph/explore` |
| UI | `src/components/graph/graph-explore-bar.tsx` |

## 列表视图与判断侧栏

探索成功后：

- **图谱 / 列表**：顶部切换；列表模式展示节点、关系、路径表格
- **右侧栏**：图谱模式下打开，含「列表」「判断」两个 Tab
- **判断**：拉取范围内标的/层的 active + candidate 断言（需 API）

## LLM 意图解析（可选）

API 模式可勾选 **LLM 解析**（需服务端 `OPENAI_API_KEY`）：

```http
GET /graph/explore?q=...&llm=true
```

无 Key 时自动回退规则解析。批量查询断言：

```http
GET /assertions?entityIds=nvidia,tsmc&limit=50
```
