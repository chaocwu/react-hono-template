# React Hono Template

一个基于 React + Hono 的全栈 TypeScript 项目模板，使用 Bun 工作空间和 Turbo 构建。

## 技术栈

| 层级 | 技术 |
|------|------|
| 包管理器 | Bun 1.3.11 |
| 构建工具 | Turbo 2.9.4 |
| 前端 | React 19, Vite 8, TypeScript 6 |
| 路由 | TanStack Router (文件路由) |
| 数据获取 | TanStack Query 5 |
| 后端 | Hono 4.12.x |
| 数据库 | SQLite (libSQL) + Drizzle ORM |
| 认证 | Better Auth 1.6+ |
| UI 组件 | shadcn/ui (Base Nova) |
| 样式 | Tailwind CSS 4 |
| 代码质量 | Oxlint + Oxfmt |

## 目录结构

```
.
├── apps/
│   ├── api/          # Hono 后端 API
│   │   ├── src/
│   │   │   ├── index.ts         # 入口
│   │   │   ├── lib/             # 工具库 (auth, db, utils)
│   │   │   ├── middlewares/     # 中间件
│   │   │   ├── routes/          # 路由处理器
│   │   │   └── schemas/         # 数据库表定义
│   │   └── drizzle.config.ts
│   └── web/          # React 前端
│       ├── src/
│       │   ├── routes/          # 文件路由
│       │   ├── components/      # 组件
│       │   ├── hooks/           # 自定义 Hooks
│       │   ├── lib/             # 工具库
│       │   └── queries/         # TanStack Query 定义
│       └── vite.config.ts
├── packages/
│   └── ui/           # 共享 UI 组件 (shadcn)
└── turbo.json        # Turbo 任务配置
```

## 快速开始

### 环境要求

- [Bun](https://bun.sh) 1.3.11 或更高版本

### 安装依赖

```bash
bun install
```

### 环境变量配置

```bash
# 1. 复制环境变量模板
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 2. 编辑 .env 文件，填入必要的配置
# - API: BETTER_AUTH_SECRET, GITEE_CLIENT_ID, GITEE_CLIENT_SECRET
# - Web: 通常不需要修改默认值
```

### 数据库初始化

```bash
cd apps/api
bun run db:push
```

### 启动开发服务器

```bash
# 同时启动 API 和 Web
cd apps/api && bun run dev &
cd apps/web && bun run dev

# 或者分别启动
# Terminal 1
cd apps/api && bun run dev

# Terminal 2
cd apps/web && bun run dev
```

访问 http://localhost:5173 查看应用。

## 可用命令

### 根目录

```bash
bun run check      # 运行所有检查 (lint + format check + typecheck)
bun run fix        # 修复所有可自动修复的问题
bun run clean      # 清理构建产物和依赖
bun run prepare    # 初始化 git hooks
```

### API 应用 (`apps/api`)

```bash
bun run dev        # 开发模式（热重载）
bun run test       # 运行测试 (Bun 内置测试框架)
bun run typecheck  # 类型检查

# 数据库操作
bun run db:generate  # 生成迁移文件
bun run db:migrate   # 运行迁移
bun run db:push      # 推送 schema 变更（开发模式）
bun run db:studio    # 打开 Drizzle Studio
```

### Web 应用 (`apps/web`)

```bash
bun run dev        # 开发服务器
bun run build      # 生产构建
bun run preview    # 预览生产构建
bun run typecheck  # 类型检查
```

## 开发指南

### 添加 UI 组件

```bash
# 添加 shadcn 组件到 web 应用
bunx shadcn@latest add button -c apps/web

# 组件会安装到 packages/ui/src/components/
```

### 添加 API 路由

1. 在 `apps/api/src/routes/` 创建路由处理器
2. 在 `apps/api/src/schemas/` 添加 Zod 验证 schema
3. 在 `apps/api/src/index.ts` 注册路由
4. 在 `apps/web/src/queries/` 创建对应的 TanStack Query hooks

### 添加数据库表

1. 在 `apps/api/src/schemas/` 定义表结构
2. 运行 `bun run db:generate` 和 `bun run db:migrate`
3. 导出 Zod schema 用于验证

## CI/CD

项目配置了 GitHub Actions 流水线，会在 PR 时自动运行：

- Lint & Format Check
- Type Check
- Build

## 依赖更新

手动更新依赖：

```bash
# 检查可更新的依赖
bun outdated

# 更新所有依赖
bun update

# 更新特定包
bun update <package-name>
```

## 许可证

MIT
