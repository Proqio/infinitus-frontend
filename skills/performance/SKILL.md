---
name: performance
description: Frontend performance patterns for React 19 + Vite + TanStack Query + Zustand. Trigger when creating new pages/routes (lazy loading), optimizing bundle size, configuring Vite build, adding virtualization to long lists, or reducing unnecessary network requests.
license: Apache-2.0
metadata:
    author: Infinitus
    version: '1.0'
    scope: [frontend]
    auto_invoke:
        - 'Creating new pages or routes'
        - 'Optimizing bundle size or build configuration'
        - 'Adding virtualization to long lists or tables'
        - 'Configuring Vite build'
        - 'Optimizing frontend performance'
    allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

- Creating a new page component (always lazy-load it)
- Adding a new dependency that might be large
- Building lists or tables with more than ~50 rows
- Setting up `queryOptions` in TanStack Query
- Configuring Vite `build` options
- Suspected unnecessary re-renders in Zustand consumers

---

## Critical Patterns

### 1. Code Splitting — Lazy Load Every Page (REQUIRED)

Every page/view must be loaded lazily. Vite generates a separate `.js` chunk per `lazy()` import — the browser only downloads it when the user navigates there.

```tsx
// src/App.tsx (or your router file)
import { lazy, Suspense } from 'react';

// ✅ One lazy() per page
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

function App() {
    return <Suspense fallback={<PageSkeleton />}>{/* your router here */}</Suspense>;
}
```

```tsx
// ❌ Never import pages eagerly at the top level
import DashboardPage from './pages/DashboardPage'; // defeats code splitting
```

**Rule:** shared/small components (buttons, inputs, cards) → normal import. Pages → always `lazy()`.

---

### 2. Vite Build — Manual Chunks for Vendor Caching

Splitting vendors into dedicated chunks lets the browser cache them independently from your app code. When you ship a bug fix, users only re-download your code, not React or Zustand.

See [assets/vite.config.example.ts](assets/vite.config.example.ts) for the full reference config.

```ts
// vite.config.ts — build section
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        "vendor-react":   ["react", "react-dom"],
        "vendor-query":   ["@tanstack/react-query"],
        "vendor-zustand": ["zustand"],
        "vendor-forms":   ["react-hook-form", "@hookform/resolvers", "zod"],
        "vendor-ui":      ["proqio-ui"],
      },
    },
  },
},
```

Add a new key whenever you install a large library (e.g. `"vendor-charts": ["recharts"]`).

---

### 3. Bundle Analysis — Know What You're Shipping

Install once, use when diagnosing bundle bloat:

```bash
pnpm add -D rollup-plugin-visualizer
```

```ts
// vite.config.ts — add to plugins array (only runs on build)
import { visualizer } from "rollup-plugin-visualizer";

plugins: [
  react({ ... }),
  tailwindcss(),
  visualizer({ open: true, gzipSize: true, filename: "stats.html" }),
],
```

Run `pnpm build` → `stats.html` opens automatically showing a treemap of all chunks.

**When to run:** before adding a library, after adding a library, when build size feels large.

---

### 4. TanStack Query — Avoid Redundant Network Requests

`staleTime: 0` (the default) causes a refetch every time a component mounts. Always set an explicit `staleTime` in every `queryOptions` call.

```ts
// src/api/queries/findings.ts
import { queryOptions } from '@tanstack/react-query';

export const findingQueries = {
    list: (filters: FindingFilters) =>
        queryOptions({
            queryKey: ['findings', filters],
            queryFn: () => fetchFindings(filters),
            staleTime: 5 * 60_000, // fresh for 5 min → no refetch on remount
            gcTime: 10 * 60_000, // kept in cache 10 min after unmount
        }),

    detail: (id: string) =>
        queryOptions({
            queryKey: ['findings', id],
            queryFn: () => fetchFinding(id),
            staleTime: 60_000,
        }),
};
```

**Global defaults** — set a baseline in `QueryClient` so you never forget:

```ts
// src/main.tsx
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000, // 1 min baseline for all queries
            gcTime: 5 * 60_000,
            retry: 1,
        },
    },
});
```

Per-query `staleTime` overrides the global. Use longer values for rarely-changing data (user profile, config), shorter for frequently-updated data (live scan results).

**Prefetching** — load data before the user navigates:

```ts
// On hover of a link, or in a route loader
queryClient.prefetchQuery(findingQueries.detail(id));
```

---

### 5. Zustand — Selectors to Prevent Re-renders

Without a selector, a component re-renders whenever **any** part of the store changes.

```ts
// ❌ Subscribes to the entire store — re-renders on any change
const { user, settings, theme } = useAppStore();

// ✅ Subscribe only to what this component needs
const user = useAppStore((state) => state.user);

// ✅ Multiple fields — use useShallow to avoid new object reference each render
import { useShallow } from 'zustand/react/shallow';

const { name, email } = useAppStore(useShallow((state) => ({ name: state.name, email: state.email })));
```

---

### 6. Virtualization — Long Lists and Tables

Rendering 500+ rows destroys scroll performance. Use `@tanstack/react-virtual` to render only visible rows.

```bash
pnpm add @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function FindingsList({ findings }: { findings: Finding[] }) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: findings.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 56, // estimated row height in px
        overscan: 5, // extra rows above/below viewport
    });

    return (
        <div
            ref={parentRef}
            style={{ height: '600px', overflow: 'auto' }}
        >
            <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                {virtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                            height: `${virtualRow.size}px`,
                        }}
                    >
                        <FindingRow finding={findings[virtualRow.index]} />
                    </div>
                ))}
            </div>
        </div>
    );
}
```

**Rule of thumb:** >50 rows in a scrollable container → consider virtualization. >200 rows → always virtualize.

---

### 7. Images — Native Lazy Loading

```tsx
// ✅ Free, no library needed — browser defers off-screen images
<img
    src="/screenshot.png"
    loading="lazy"
    alt="..."
    width={800}
    height={450}
/>

// Always provide width + height to prevent layout shift (CLS)
```

- Prefer `.webp` or `.avif` over `.png`/`.jpg` (30–50% smaller)
- SVGs used repeatedly → import as React component (inlined, no HTTP request)

```tsx
import ViteLogo from './assets/vite.svg?react'; // Vite's ?react suffix
<ViteLogo className="h-8 w-8" />;
```

---

### 8. Preconnect — Warm Up API Connections

Add to `index.html` so the browser prepares the TCP connection before the app even loads:

```html
<!-- index.html <head> -->
<link
    rel="preconnect"
    href="https://api.your-domain.com"
/>
<link
    rel="dns-prefetch"
    href="https://api.your-domain.com"
/>
```

---

## Decision Table

| Situation                         | Action                                    |
| --------------------------------- | ----------------------------------------- |
| Creating a new page               | Wrap in `lazy(() => import(...))`         |
| List with >50 rows                | Use `@tanstack/react-virtual`             |
| Query refetches too often         | Add `staleTime` to `queryOptions`         |
| Component re-renders unexpectedly | Add Zustand selector / `useShallow`       |
| Build size feels large            | Run `rollup-plugin-visualizer`            |
| Adding a new large library        | Add to `manualChunks` in `vite.config.ts` |
| Off-screen images loading eagerly | Add `loading="lazy"`                      |

---

## Commands

```bash
# Analyze bundle (opens stats.html)
pnpm build

# Check current chunk sizes after build
ls -lh dist/assets/*.js
```

## Resources

- **Templates**: See [assets/vite.config.example.ts](assets/vite.config.example.ts) for full Vite build config
- **TanStack Virtual**: https://tanstack.com/virtual/latest
- **Rollup visualizer**: https://github.com/btd/rollup-plugin-visualizer
- **web.dev performance**: https://web.dev/performance
