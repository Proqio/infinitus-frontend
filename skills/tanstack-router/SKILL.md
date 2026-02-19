---
name: tanstack-router
description: TanStack Router v1 patterns and best practices for type-safe client-side routing. Trigger when creating routes, navigating between pages, reading URL params or search params, setting up file-based routing, integrating route loaders with TanStack Query, or using Link, useNavigate, useParams, useSearch in React components.
license: Apache-2.0
metadata:
    author: Infinitus
    version: '1.0'
    scope: [frontend]
    auto_invoke:
        - 'Creating new pages or routes'
        - 'Navigating between pages'
        - 'Reading URL params or search params'
        - 'Setting up routing'
        - 'Using Link or useNavigate'
    allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

- Setting up or extending the routing tree
- Creating new pages / route files
- Reading typed path params (`useParams`) or search params (`useSearch`)
- Navigating programmatically (`useNavigate`, `router.navigate`)
- Integrating route loaders with TanStack Query (`prefetchQuery`)
- Protecting routes (authentication guards)
- Lazy-loading heavy route components for performance
- Validating and typing search params with Zod

---

## Critical Patterns

### 1. File-Based Routing (required) — Vite plugin generates the route tree

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

export default defineConfig({
    plugins: [
        TanStackRouterVite(), // Must be BEFORE react()
        react(),
    ],
});
```

The plugin watches `src/routes/` and auto-generates `src/routeTree.gen.ts`. **Never edit that file.**

### 2. Route file naming convention

```
src/routes/
├── __root.tsx          # Root layout (wraps everything)
├── index.tsx           # / (home)
├── about.tsx           # /about
├── users/
│   ├── index.tsx       # /users
│   └── $userId.tsx     # /users/:userId  ($ prefix = param)
├── _auth/              # Layout route (underscore = pathless)
│   ├── _auth.tsx       # Layout component (no segment in URL)
│   ├── dashboard.tsx   # /dashboard (inside auth layout)
│   └── settings.tsx    # /settings  (inside auth layout)
└── (public)/           # Group folder — no URL segment
    └── login.tsx       # /login
```

### 3. Root route — always has `<Outlet />`

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <nav>...</nav>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
```

### 4. Index / leaf routes

```typescript
// src/routes/users/$userId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId")({
  component: UserDetail,
});

function UserDetail() {
  const { userId } = Route.useParams(); // fully typed
  return <div>User: {userId}</div>;
}
```

### 5. Bootstrap the router in main.tsx

```typescript
// src/routeTree.gen.ts — auto-generated, do NOT edit
import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";

const router = createRouter({ routeTree });

// TypeScript augmentation — required once
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

### 6. Type-safe `<Link>` — never use `<a href>`

```typescript
import { Link } from "@tanstack/react-router";

// ✅ Fully typed — TypeScript error if path or params are wrong
<Link to="/users/$userId" params={{ userId: "123" }}>
  View user
</Link>

// ✅ Relative link
<Link to="..">Back</Link>

// ✅ Active class
<Link to="/dashboard" activeProps={{ className: "font-bold" }}>
  Dashboard
</Link>
```

### 7. Programmatic navigation

```typescript
import { useNavigate } from '@tanstack/react-router';

function LoginButton() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        await doLogin();
        navigate({ to: '/dashboard' });
    };
}
```

### 8. Search params — always validate with Zod

```typescript
// src/routes/users/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";

const searchSchema = z.object({
  page:   z.number().int().min(1).default(1),
  q:      z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const Route = createFileRoute("/users/")({
  validateSearch: zodSearchValidator(searchSchema),
  component: UserList,
});

function UserList() {
  const { page, q, status } = Route.useSearch(); // typed from schema

  return (
    <Link
      to="/users"
      search={(prev) => ({ ...prev, page: prev.page + 1 })}
    >
      Next page
    </Link>
  );
}
```

### 9. Route loaders + TanStack Query (preferred pattern)

Loaders prefetch data before the component renders — no loading spinners.

```typescript
// src/routes/users/$userId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userQueries } from "@/api/queries/users";

export const Route = createFileRoute("/users/$userId")({
  loader: ({ context: { queryClient }, params: { userId } }) =>
    queryClient.ensureQueryData(userQueries.detail(userId)),
  component: UserDetail,
});

function UserDetail() {
  const { userId } = Route.useParams();
  const { data } = useSuspenseQuery(userQueries.detail(userId));
  // data is always defined — loader guarantees it
  return <div>{data.name}</div>;
}
```

```typescript
// src/main.tsx — pass queryClient via router context
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    context: { queryClient }, // available in all loaders
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Define context type in __root.tsx:
// createRootRouteWithContext<{ queryClient: QueryClient }>()
```

### 10. Root route with context

```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
});
```

### 11. Authentication guard — `beforeLoad`

```typescript
// src/routes/_auth/_auth.tsx  (pathless layout route)
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.isAuthenticated) {
            throw redirect({
                to: '/login',
                search: { redirect: location.href },
            });
        }
    },
    component: AuthLayout,
});
```

### 12. Lazy loading — split route component from definition

```typescript
// src/routes/heavy-page.tsx
import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';

export const Route = createFileRoute('/heavy-page')({
    component: lazyRouteComponent(() => import('@/components/HeavyPage'), 'HeavyPage'),
});
```

### 13. Pending UI (skeleton while loader runs)

```typescript
export const Route = createFileRoute("/users/$userId")({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(userQueries.detail(params.userId)),
  pendingComponent: UserDetailSkeleton,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
  component: UserDetail,
});
```

---

## Decision Tree

```
Need to navigate?
  └─ Declarative (JSX)           → <Link to="..." />
  └─ Programmatic (event/effect) → useNavigate()

Need URL data?
  └─ Path segment (/users/:id)   → Route.useParams()
  └─ Query string (?page=2)      → Route.useSearch()  + validateSearch (Zod)

Creating a new page?
  └─ Add file to src/routes/
  └─ Use createFileRoute("/exact/path")
  └─ Export const Route = ...

Data fetching in route?
  └─ With TanStack Query          → loader + ensureQueryData + useSuspenseQuery
  └─ Simple/one-off               → loader returns data, Route.useLoaderData()

Protected pages?
  └─ beforeLoad + redirect()     → in pathless layout route (_auth/_auth.tsx)

Heavy component?
  └─ lazyRouteComponent()        → automatic code splitting
```

---

## File Structure

```
src/
├── main.tsx                  # createRouter + RouterProvider
├── routeTree.gen.ts          # AUTO-GENERATED — never edit
└── routes/
    ├── __root.tsx             # Root layout + context declaration
    ├── index.tsx              # /
    ├── login.tsx              # /login
    ├── _auth/
    │   ├── _auth.tsx          # Auth guard (beforeLoad)
    │   ├── dashboard/
    │   │   └── index.tsx      # /dashboard
    │   └── settings.tsx       # /settings
    └── users/
        ├── index.tsx          # /users  (+ search params)
        └── $userId.tsx        # /users/:userId
```

---

## Resources

- **Docs**: https://tanstack.com/router/latest/docs/framework/react/overview
- **File-based routing**: https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing
- **Search params**: https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- **Route context**: https://tanstack.com/router/latest/docs/framework/react/guide/router-context
- **Data loading**: https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
