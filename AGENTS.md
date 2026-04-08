# React Hono Template - Agent Guide

This document provides essential information for AI coding agents working on this project.

## Project Overview

This is a **full-stack TypeScript monorepo** featuring a React frontend and Hono backend. It uses Bun workspaces with Turbo for task orchestration and follows modern development practices with strict type checking, linting, and code formatting.

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Package Manager** | Bun 1.3.11 |
| **Monorepo Tool** | Turbo 2.9.4 |
| **Frontend** | React 19, Vite 8, TypeScript 6 |
| **Routing** | TanStack Router (file-based) |
| **Data Fetching** | TanStack Query 5 |
| **Backend** | Hono 4.12.x |
| **Database** | SQLite (libSQL) with Drizzle ORM |
| **Authentication** | Better Auth 1.6+ |
| **UI Components** | shadcn/ui (Base Nova style) + Base UI |
| **Styling** | Tailwind CSS 4 |
| **Linting** | Oxlint |
| **Formatting** | Oxfmt |

## Project Structure

```
.
├── apps/
│   ├── api/              # Hono backend API
│   │   ├── src/
│   │   │   ├── index.ts         # App entry point
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts      # Better Auth configuration
│   │   │   │   ├── db.ts        # Drizzle ORM setup
│   │   │   │   └── utils.ts     # API utilities (success/error helpers)
│   │   │   ├── middlewares/
│   │   │   │   └── logger.ts    # Pino logging middleware
│   │   │   ├── routes/
│   │   │   │   └── tasks.ts     # Route handlers
│   │   │   └── schemas/
│   │   │       ├── auth.ts      # Auth tables (user, session, account, verification)
│   │   │       ├── test.ts      # Tasks and tests tables
│   │   │       └── columns.helpers.ts  # Shared column definitions
│   │   ├── drizzle.config.ts    # Drizzle Kit configuration
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── main.tsx         # App entry point
│       │   ├── routes/          # File-based routes for TanStack Router
│       │   │   ├── __root.tsx   # Root layout
│       │   │   ├── _app.tsx     # Authenticated layout
│       │   │   ├── _app.index.tsx
│       │   │   └── login.tsx
│       │   ├── components/
│       │   │   ├── theme-provider.tsx
│       │   │   └── tasks/
│       │   ├── hooks/
│       │   ├── lib/
│       │   │   ├── auth.ts      # Better Auth client
│       │   │   └── rpc.ts       # Hono RPC client
│       │   └── queries/         # TanStack Query definitions
│       ├── vite.config.ts
│       └── components.json      # shadcn/ui config
└── packages/
    └── ui/                 # Shared UI components
        ├── src/
        │   ├── components/      # shadcn components (button, table, etc.)
        │   ├── lib/
        │   │   └── utils.ts     # cn() helper for Tailwind
        │   └── styles/
        │       └── globals.css  # Global styles & CSS variables
        └── components.json
```

## Available Scripts

### Root Level

```bash
# Run all checks (lint + format check + typecheck)
bun run check

# Fix all auto-fixable issues
bun run fix

# Clean all build artifacts and dependencies
bun run clean

# Prepare git hooks
bun run prepare
```

### API App (`apps/api`)

```bash
cd apps/api

# Development with hot reload
bun run dev

# Database operations
bun run db:generate    # Generate migration files
bun run db:migrate     # Run pending migrations
bun run db:push        # Push schema changes (dev mode)
bun run db:studio      # Open Drizzle Studio

# Type checking
bun run typecheck
```

### Web App (`apps/web`)

```bash
cd apps/web

# Development server
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Type checking
bun run typecheck
```

## Code Style Guidelines

### Linting & Formatting

This project uses **Oxlint** for linting and **Oxfmt** for formatting:

- **Linting**: `oxlint` with TypeScript, Unicorn, and OXC plugins
- **Formatting**: `oxfmt` with automatic import sorting and Tailwind class sorting
- **Pre-commit**: Husky + lint-staged runs linting and formatting on staged files

### Import Sorting (oxfmtrc.json)

Imports are automatically sorted into these groups:
1. `type-import` - Type-only imports
2. `value-builtin` + `value-external` - Node.js built-ins and npm packages
3. `type-internal` - Internal type imports
4. `value-internal` - Internal value imports
5. `type-parent/type-sibling/type-index` - Relative type imports
6. `value-parent/value-sibling/value-index` - Relative value imports
7. `unknown` - Everything else

### Tailwind CSS Class Sorting

Tailwind classes are automatically sorted in:
- `clsx()` calls
- `cn()` calls (from `@template/ui/lib/utils`)
- `cva()` definitions

### TypeScript Configuration

- **Target**: ESNext
- **Module**: ESNext with Bundler resolution
- **Strict mode**: Enabled
- **JSX**: `react-jsx` transform
- **No emit**: TypeScript only used for type checking

## Key Architectural Patterns

### 1. Type-Safe API with Hono RPC

The API uses Hono's RPC feature for end-to-end type safety:

```typescript
// apps/api/src/index.ts
const routes = app.route("/tasks", tasks);
export type AppType = typeof routes;

// apps/web/src/lib/rpc.ts
import { hc } from "hono/client";
import type { AppType } from "@template/api/index";
export const client = hc<AppType>(import.meta.env.VITE_API_URL);
```

### 2. File-Based Routing (TanStack Router)

Routes are defined by files in `apps/web/src/routes/`:

- `__root.tsx` - Root layout wrapper
- `_app.tsx` - Layout with authentication guard
- `_app.index.tsx` - Index route (requires auth)
- `login.tsx` - Login page

### 3. Query Pattern with TanStack Query

Queries are defined as reusable options objects:

```typescript
// apps/web/src/queries/tasks.ts
export const taskListQueryOptions = queryOptions({
  queryKey: ["tasks"],
  queryFn: async () => {
    const response = await client.tasks.$get();
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return await response.json();
  },
});
```

### 4. Database Schema Pattern

Drizzle ORM schemas use:
- `sqliteTable` for table definitions
- `createId()` from `@paralleldrive/cuid2` for IDs
- `timestamps` helper for createdAt/updatedAt
- `defineRelations` for relationships
- `createInsertSchema/createSelectSchema/createUpdateSchema` for Zod validation

### 5. Authentication Flow

Uses **Better Auth** with:
- Drizzle adapter for SQLite
- Generic OAuth plugin for Gitee integration
- Session-based authentication

```typescript
// Server-side session retrieval
const session = await auth.api.getSession({ headers: c.req.raw.headers });

// Client-side auth
const authClient = createAuthClient({ baseURL: import.meta.env.VITE_API_URL });
```

## Adding UI Components

This project uses shadcn/ui with the "Base Nova" style:

```bash
# Add a component to the web app
bunx shadcn@latest add button -c apps/web

# Components are installed to packages/ui/src/components/
```

Import components using:
```typescript
import { Button } from "@template/ui/components/button";
```

## Environment Variables

### API (`apps/api/.env`)

```
DB_FILE_NAME=local.db                    # SQLite database file
BETTER_AUTH_URL=http://localhost:3000    # Auth base URL
BETTER_AUTH_SECRET=your-secret           # Auth secret key
CORS_ORIGIN=http://localhost:5173        # Frontend origin
GITEE_CLIENT_ID=xxx                      # Gitee OAuth credentials
GITEE_CLIENT_SECRET=xxx
```

### Web (`apps/web/.env`)

```
VITE_API_URL=http://localhost:3000       # API base URL
VITE_WEB_URL=http://localhost:5173       # Web app URL
```

## Testing

### API Tests (`apps/api`)

使用 Bun 内置测试框架 (`bun:test`)：

```bash
cd apps/api
bun test              # 运行所有测试
bun test --watch      # 监听模式
```

#### 测试文件结构

```
src/tests/
├── health.test.ts      # Health check 端点测试
├── tasks.test.ts       # Tasks API 测试
└── auth-example.test.ts # 认证测试示例
```

#### 测试模式

**1. 基础路由测试**

```typescript
import { createTaskRoutes } from "../routes/tasks";
import { drizzle } from "drizzle-orm/libsql";

const testDb = drizzle(":memory:", { ... });
const app = createTaskRoutes(testDb);  // 使用内存数据库
```

路由使用 `createTaskRoutes(database?)` 工厂函数，支持注入测试数据库。

**2. 认证路由测试**

有两种方式测试需要认证的路由：

- **Mock 认证**（单元测试）：注入 mock 中间件直接设置 `c.var.user`
- **真实认证**（集成测试）：使用 Better Auth 创建真实 session

详见 `auth-example.test.ts` 中的示例代码。

### Web Tests (`apps/web`)

尚未配置。推荐使用 Vitest 进行 React 组件测试。

### 添加测试到 CI

测试已集成到 CI 流水线，会在 PR 时自动运行。

## Security Considerations

1. **CORS**: Configured in `apps/api/src/index.ts` with origin whitelist
2. **Authentication**: All protected routes check session via `beforeLoad` in TanStack Router
3. **Environment Variables**: Never commit `.env` files (they are gitignored)
4. **Dependencies**: Keep dependencies updated and audit with `bun audit`

## Common Tasks

### Adding a New API Route

1. Create route handler in `apps/api/src/routes/`
2. Add Zod schemas for validation in `apps/api/src/schemas/`
3. Register route in `apps/api/src/index.ts` with `app.route("/path", route)`
4. Create corresponding TanStack Query hooks in `apps/web/src/queries/`

### Adding a New Database Table

1. Define table in `apps/api/src/schemas/`
2. Add to `defineRelations` if relationships exist
3. Generate and run migrations: `bun run db:generate && bun run db:migrate`
4. Export Zod schemas for validation

### Adding a New Page

1. Create route file in `apps/web/src/routes/`
2. Follow naming convention for layouts (`_layout.tsx`) and nested routes
3. Use `createFileRoute` from `@tanstack/react-router`
4. Add query loader if data fetching is needed

## Troubleshooting

### Type Issues Across Packages

If types from `@template/api` or `@template/ui` are not resolving:
1. Ensure the package is built or has exports properly defined
2. Check that `tsconfig.json` paths are correctly set
3. Restart TypeScript language server

### Database Issues

If Drizzle Studio or migrations fail:
1. Check `DB_FILE_NAME` environment variable is set
2. Ensure the database file exists and is writable
3. Review `drizzle.config.ts` for correct schema paths

### Hot Reload Not Working

For the API, Bun's hot reload watches for file changes. If not working:
1. Ensure `bun run dev` is running
2. Check that files are in the watched directory (`src/`)

## References

- [Hono Documentation](https://hono.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
