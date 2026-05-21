# M3 完成说明：可维护图谱

> 状态：**已完成**（2026-05-20）  
> 前置：[m2-completion.md](./m2-completion.md)

## 交付摘要

M3 在 M2 只读图谱 API 之上补齐 **写入、审核、审计** 能力：

| 能力 | 说明 |
|------|------|
| Entity / Relation CRUD | `POST/PATCH` + `deprecate`，自动写 `audit_logs` |
| Assertion / Evidence | 创建、审核（verify → verified → active）、拒绝、废弃、关联证据 |
| 审核 UI | `/review/assertions` |
| 图谱详情 | 节点面板展示 `active` 判断（API 模式） |
| 演示数据 | `pnpm db:seed:m3-demo` |

## API 端点

```text
GET/POST/PATCH  /entities, /entities/:id/deprecate
GET             /entities/:id/assertions?status=
GET/POST/PATCH  /relations, /relations/:id/deprecate
GET/POST/PATCH  /assertions
POST            /assertions/:id/verify|reject|deprecate|link-evidence
GET/POST        /evidences
GET             /audit-logs?targetType=&targetId=
```

写操作请求头：`X-Actor-Id`（默认 `local-user`）。

## 本地开发

```bash
pnpm db:setup
pnpm db:migrate
pnpm db:seed
pnpm db:seed:m3-demo   # M3 演示断言
pnpm dev:stack         # API :3001 + Web :13000
```

- 审核页：http://localhost:13000/review/assertions  
- 图谱（API 数据）：http://localhost:13000/graph  

## 测试

```bash
pnpm test:api   # 含 graph + M3 写 API 用例
```

## 未纳入 M3（留给 M4+）

- Worker / LLM 抽取
- `/research/*`、文档 ingest
- 完整 Admin 实体编辑 UI
