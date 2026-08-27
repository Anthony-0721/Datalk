# Datalk

Datalk 是一个本地运行的自然语言问数（Text-to-SQL）项目。它将字段级 Schema 检索、LLM 生成 SQL、DuckDB 执行、人工澄清、权限隔离和结果记忆整合为一个轻量 Web 应用。

用户可以用自然语言提问，例如：

- 查询 2026 年 8 月各地区销售额
- 按客户等级统计本月销售额
- 对比本月各地区销售额和销售目标

## 功能特性

- **自然语言问数**：支持业务口径识别、Schema 检索和 SQL 生成。
- **字段级 Schema 检索**：使用 BM25、向量召回、RRF 融合和 Rerank 选择相关字段。
- **Human-in-the-loop**：缺少关键口径时暂停并请求澄清。
- **只读 SQL**：通过 SQLGlot 校验，禁止写操作和 `SELECT *`。
- **数据可视化**：查询结果以表格展示，支持分页和 Excel 导出。
- **记忆与上下文**：支持保存查询结果、收藏字段、短上下文和会话归档。
- **权限隔离**：admin 拥有全部权限，sales 无法访问历史订单表。
- **本地 MCP 工具**：内置当前时间、日期范围解析和本地数据库只读查询工具。
- **Docker 一键启动**：一个命令启动 FastAPI 后端和 Vue 前端。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Vue 3、TypeScript、Vite |
| 后端 | FastAPI、Uvicorn、LangGraph |
| 数据 | DuckDB、CSV 只读数据源 |
| 检索 | BM25、Dense Embedding、RRF、Rerank |
| 模型接口 | OpenAI 兼容的 DashScope API |
| 工具 | MCP、SQLGlot、Docker Compose |

## 仓库结构

```text
.
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI 路由
│   │   ├── mcp_runtime/         # 本地 MCP 服务
│   │   ├── querying/            # DuckDB 执行和 SQL 校验
│   │   ├── retrieval/           # 字段 Schema 索引与检索
│   │   ├── security/            # 登录、令牌和权限
│   │   ├── services/            # 查询服务、记忆、会话
│   │   ├── workflows/           # LangGraph 查询流程
│   │   └── skills/              # 应用级 Skill 定义
│   ├── tests/                   # 后端测试
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/                     # Vue 页面与组件
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docs/agents/                 # Agent Skills 配置
├── AGENTS.md
├── docker-compose.yml
└── README.md
```

## 快速开始

### 方式一：Docker（推荐）

前置条件：

- 安装并启动 Docker Desktop。
- 准备一个可用的 DashScope API Key。

首次运行：

```powershell
# 在项目根目录执行
Copy-Item backend\.env.example backend\.env

# 编辑 backend/.env，至少填写 LLM_API_KEY
docker compose up --build -d
```

启动后访问：

- 前端页面：<http://127.0.0.1:5173>
- API 文档：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/api/health>

停止服务：

```powershell
docker compose down
```

修改 `backend/.env` 中的 API Key 后，需要重建后端容器才能生效：

```powershell
docker compose up -d --force-recreate backend
```

### 方式二：手动启动

#### 后端

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
# 编辑 backend/.env，填写 LLM_API_KEY
.\.venv\Scripts\python.exe run.py
```

后端默认监听 `127.0.0.1:8000`。

#### 前端

```powershell
cd frontend
npm install
npm run dev
```

前端默认监听 `127.0.0.1:5173`，开发服务器会把 `/api` 代理到 `127.0.0.1:8000`。

如果本机没有单独安装 Node.js，可以使用项目自带的 Node 运行时：

```powershell
cd frontend
.\npm-local.cmd run dev
```

## 环境变量

后端配置位于 `backend/.env`。该文件已被 `.gitignore` 排除，不会进入 Git 仓库。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `LLM_API_KEY` | 必填 | DashScope/OpenAI 兼容 API Key |
| `LLM_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | Chat Completions 接口地址 |
| `LLM_MODEL` | `qwen3.7-plus` | 问答模型 |
| `LLM_TIMEOUT` | `10` | 模型请求超时秒数 |
| `LLM_TEMPERATURE` | `0` | 生成温度 |
| `LLM_MAX_RETRIES` | `0` | 最大重试次数 |
| `EMBEDDING_MODEL` | `text-embedding-v4` | Embedding 模型 |
| `EMBEDDING_DIMENSIONS` | `1024` | 向量维度 |
| `RERANK_MODEL` | `qwen3-rerank` | Rerank 模型 |
| `RERANK_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-api/v1` | Rerank 接口地址 |
| `SCHEMA_RECALL_THRESHOLD` | `0.55` | Rerank 命中阈值 |
| `BM25_TOP_K` | `30` | BM25 召回数 |
| `DENSE_TOP_K` | `30` | 向量召回数 |
| `RRF_TOP_K` | `40` | RRF 融合候选数 |
| `MAX_SCHEMA_FIELDS` | `20` | 最终进入 Schema 图的字段数 |
| `MAX_SAVED_MEMORIES` | `20` | 每用户最多保存的记忆数 |
| `MCP_MAX_TOOL_CALLS` | `3` | MCP 工具最大调用次数 |
| `SHORT_TERM_SUMMARY_ENABLED` | `true` | 是否启用短期上下文摘要 |
| `SHORT_TERM_SUMMARY_TRIGGER_TOKENS` | `12000` | 触发摘要的 Token 阈值 |
| `SHORT_TERM_SUMMARY_BATCH_TOKENS` | `6000` | 摘要批处理 Token 数 |
| `SHORT_TERM_MIN_RECENT_TURNS` | `5` | 摘要所需最少最近轮数 |
| `SESSION_ARCHIVE_ENABLED` | `false` | 是否启用会话归档 |
| `SESSION_ARCHIVE_PATH` | `data/session_archive.db` | 会话归档文件 |
| `CONTEXT_TABLE_ROW_LIMIT` | `50` | 上下文表格最多携带行数 |
| `ROUTE_CONTEXT_TURNS` | `6` | 路由判断使用的最近轮数 |

完整配置参考：[`backend/.env.example`](backend/.env.example)。

## 示例数据

后端启动时如果本地 CSV 数据不存在，会自动生成销售示例数据，位于：

```text
backend/data/databases/datalk_mock/
```

示例数据表：

| 表 | 说明 | 行数 |
| --- | --- | --- |
| `orders_current` | 2026 年 8 月当前订单 | 240 |
| `orders_history` | 2026 年 6-7 月历史订单 | 480 |
| `customers` | 客户信息 | 30 |
| `products` | 产品信息 | 12 |
| `sales_targets` | 地区销售目标 | 8 |

本地生成的索引、记忆、数据库和会话归档均不会被提交。

## 演示账号

| 账号 | 密码 | 权限 |
| --- | --- | --- |
| `admin` | `admin123` | 全部数据 |
| `sales` | `sales123` | 当前订单、客户、产品和销售目标，不包含历史订单 |

> 演示账号仅用于本地环境，不能用于生产。

## API

主要接口：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查和服务状态 |
| `POST` | `/api/auth/login` | 登录 |
| `GET` | `/api/auth/me` | 当前用户 |
| `POST` | `/api/auth/logout` | 退出登录 |
| `GET` | `/api/schema` | 当前用户可见 Schema |
| `GET` | `/api/schema/search` | 搜索字段 Schema |
| `POST` | `/api/schema/index/rebuild` | 强制重建索引（管理员） |
| `GET` | `/api/config` | 当前服务配置 |
| `GET` | `/api/mcp/tools` | 查看 MCP 工具定义 |
| `GET` | `/api/skills` | 查看应用级 Skill |
| `POST` | `/api/query` | 提交自然语言查询 |
| `POST` | `/api/tasks/{task_id}/clarify` | 回复澄清问题 |
| `GET` | `/api/tasks/{task_id}` | 获取任务结果 |
| `POST` | `/api/memories` | 保存查询结果 |
| `GET` | `/api/memories` | 获取保存的记忆 |
| `POST` | `/api/memories/fields` | 保存字段 |
| `DELETE` | `/api/memories/{memory_id}` | 删除记忆 |

除健康检查和登录外，接口需要携带：

```text
Authorization: Bearer <access_token>
```

完整的接口定义和在线调试可访问 `/docs`。

## 开发与测试

后端语法检查和测试：

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall -q app tests
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

前端构建：

```powershell
cd frontend
npm run build
```

## 安全说明

- 数据库查询只允许只读 `SELECT`，禁止写、删除、DDL 和管理语句。
- 禁止 `SELECT *`，查询必须显式列出字段。
- 单次结果最多返回 200 行。
- 登录令牌保存在后端进程内，服务重启后失效。
- `sales` 用户被限制不能访问历史订单表。
- 生产环境必须替换演示账号和令牌方案，并将后端放在可信网络内。
- `backend/.env` 包含真实 API Key，已经被 Git 忽略；请勿手动提交。

## Agent Skills 配置

仓库已配置工程化的 Agent Skills 入口：

- `AGENTS.md`：当前仓库的 Agent Skills 摘要。
- `docs/agents/issue-tracker.md`：GitHub issue 工作流。
- `docs/agents/triage-labels.md`：分类标签词汇表。
- `docs/agents/domain.md`：领域文档读取规则。

相关技能包括 `triage`、`to-tickets`、`to-spec`、`grill-with-docs`、`domain-modeling` 等。

## 许可

本项目目前未在仓库中提供许可证文件，使用前请与维护者确认。
