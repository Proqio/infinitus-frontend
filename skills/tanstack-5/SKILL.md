---
name: tanstack-5
description: TanStack Query v5 patterns and best practices for server state management. Trigger when fetching data from APIs, managing server state, using useQuery, useMutation, useInfiniteQuery, useSuspenseQuery, queryOptions, or QueryClient in React components.
license: Apache-2.0
metadata:
  author: Infinitus
  version: "1.0"
  scope: [frontend, api]
  auto_invoke:
    - "Fetching data from API"
    - "Using useQuery or useMutation"
    - "Managing server state"
    - "Creating API hooks or data fetching"
  allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

- Fetching, caching, or syncing data from any API endpoint
- Replacing `useState` + `useEffect` + `fetch` with a proper server state solution
- Performing mutations (POST, PUT, PATCH, DELETE) with optimistic updates
- Paginating or infinite-scrolling lists
- Prefetching data for navigation or hover states
- Sharing query definitions between components and the QueryClient

## Critical Patterns

### 1. Always use a single options object (v5 mandate)

```typescript
// ✅ v5 — single object, no overloads
const { data, isPending, error } = useQuery({
  queryKey: ["users"],
  queryFn: () => fetchUsers(),
});

// ❌ OLD v4 — multiple positional arguments (removed)
const { data } = useQuery(["users"], fetchUsers);
```

### 2. `queryOptions` — define once, reuse everywhere (REQUIRED)

Co-locate the key and fn so they never drift apart. This is the backbone of type-safe reusability.

```typescript
// src/api/queries/users.ts
import { queryOptions } from "@tanstack/react-query";
import { fetchUser, fetchUsers } from "../fetchers/users";

export const userKeys = {
  all: () => ["users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all(), "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userQueries = {
  list: (filters: UserFilters) =>
    queryOptions({
      queryKey: userKeys.list(filters),
      queryFn: () => fetchUsers(filters),
      staleTime: 30_000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: userKeys.detail(id),
      queryFn: () => fetchUser(id),
      staleTime: 60_000,
    }),
};
```

```typescript
// In a component
const { data } = useQuery(userQueries.detail(userId));

// In a route loader or server action
await queryClient.prefetchQuery(userQueries.list(filters));

// Type-safe cache access — no manual casting
const cached = queryClient.getQueryData(userQueries.detail(userId).queryKey);
```

### 3. Suspense — use `useSuspenseQuery` (fully supported in v5)

```typescript
// ✅ Wrap component in <Suspense> + <ErrorBoundary>, then:
function UserDetail({ id }: { id: string }) {
  // Never returns undefined — throws to Suspense/ErrorBoundary
  const { data } = useSuspenseQuery(userQueries.detail(id));
  return <div>{data.name}</div>;
}
```

```typescript
// ✅ Multiple suspense queries in parallel
function Dashboard({ userId, orgId }: Props) {
  const [userQ, orgQ] = useSuspenseQueries({
    queries: [userQueries.detail(userId), orgQueries.detail(orgId)],
  });
  return <div>{userQ.data.name} @ {orgQ.data.name}</div>;
}
```

### 4. Mutations — no `onSuccess`/`onError` callbacks on useQuery

Side-effects after mutations live in `useMutation` callbacks, NOT in `useQuery`.

```typescript
// ✅ Mutation with cache invalidation
const queryClient = useQueryClient();

const updateUser = useMutation({
  mutationFn: (payload: UpdateUserPayload) => patchUser(payload),
  onSuccess: (data) => {
    // Invalidate related queries to trigger a background refetch
    queryClient.invalidateQueries({ queryKey: userKeys.all() });
    // Or update cache directly for instant UI
    queryClient.setQueryData(userKeys.detail(data.id).queryKey, data);
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Usage
updateUser.mutate({ id: "123", name: "New Name" });
// or async
await updateUser.mutateAsync({ id: "123", name: "New Name" });
```

### 5. Replace `onSuccess`/`onError` on `useQuery` with `useEffect`

These callbacks were removed from `useQuery` in v5.

```typescript
// ✅ v5 — use useEffect for query side-effects
const { data, error } = useQuery(userQueries.detail(userId));

useEffect(() => {
  if (data) analytics.track("user_viewed", { id: data.id });
}, [data]);

useEffect(() => {
  if (error) logger.error("User fetch failed", error);
}, [error]);
```

### 6. Naming conventions (v5 renames)

| v4 name | v5 name | Notes |
|---|---|---|
| `cacheTime` | `gcTime` | Garbage collection time |
| `isLoading` | `isPending` | More accurate for initial loads |
| `keepPreviousData` | `placeholderData: keepPreviousData` | Import helper from package |
| `useErrorBoundary` | `throwOnError` | Reflects actual behavior |
| `status: "loading"` | `status: "pending"` | Consistent naming |

```typescript
import { keepPreviousData } from "@tanstack/react-query";

const { data } = useQuery({
  ...userQueries.list(filters),
  placeholderData: keepPreviousData, // Show previous page while new page loads
  gcTime: 5 * 60_000,               // Keep in cache 5 min after unmount
  staleTime: 30_000,                 // Fresh for 30s
});
```

### 7. Optimistic updates via `variables`

```typescript
const addItem = useMutation({
  mutationFn: (newItem: Item) => postItem(newItem),
});

// Show optimistic state using returned `variables`
function ItemList() {
  const { data: items = [] } = useQuery(itemQueries.list());
  const { variables, isPending } = addItem;

  return (
    <ul>
      {items.map((item) => <li key={item.id}>{item.name}</li>)}
      {isPending && (
        <li style={{ opacity: 0.5 }}>{variables?.name} (saving...)</li>
      )}
    </ul>
  );
}
```

### 8. Infinite queries with `maxPages`

```typescript
export const scanQueries = {
  infinite: (filters: ScanFilters) =>
    infiniteQueryOptions({
      queryKey: ["scans", "infinite", filters],
      queryFn: ({ pageParam }) => fetchScans({ ...filters, cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      maxPages: 10,              // Limit pages kept in memory
    }),
};

function ScanList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(scanQueries.infinite(filters));

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      {items.map((scan) => <ScanRow key={scan.id} scan={scan} />)}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </>
  );
}
```

### 9. `mutationOptions` — type-safe mutation definitions (v5.22+)

Mirrors `queryOptions` but for mutations. Define once, reuse in `useMutation` and `queryClient.executeMutation`.

```typescript
// src/api/mutations/users.ts
import { mutationOptions } from "@tanstack/react-query";
import { patchUser } from "../fetchers/users";

export const userMutations = {
  update: () =>
    mutationOptions({
      mutationKey: ["users", "update"],
      mutationFn: (payload: UpdateUserPayload) => patchUser(payload),
    }),
};

// In a component — fully typed, no manual generics
const updateUser = useMutation({
  ...userMutations.update(),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: userKeys.all() });
  },
});
```

### 11. Track cross-component mutation state

```typescript
// Track all in-flight mutations of a specific key
const pendingUploads = useMutationState({
  filters: { mutationKey: ["upload"], status: "pending" },
  select: (mutation) => mutation.state.variables as UploadPayload,
});
```

### 12. Error type is `Error` by default

```typescript
// ✅ Error is typed as Error in v5 — no casting needed
const { error } = useQuery(userQueries.detail(id));
if (error) {
  console.log(error.message); // string, always
}

// ❌ OLD — had to cast
const err = error as Error;
```

## Setup

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30s before refetch
      gcTime: 5 * 60_000,      // 5min in cache after unmount
      retry: 1,                // Retry once on failure
      throwOnError: false,     // Handle errors locally by default
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

## File Structure

```
src/api/
├── fetchers/          # Raw fetch functions (no query logic)
│   ├── users.ts
│   └── scans.ts
├── queries/           # queryOptions definitions + key factories
│   ├── users.ts
│   └── scans.ts
└── mutations/         # useMutation wrappers (optional, for reuse)
    └── users.ts
```

## Decision: `useQuery` vs `useSuspenseQuery`

| Scenario | Hook |
|---|---|
| Component handles its own loading/error UI | `useQuery` |
| Parent `<Suspense>` + `<ErrorBoundary>` exist | `useSuspenseQuery` |
| Multiple parallel queries | `useSuspenseQueries` |
| Paginated / infinite list | `useInfiniteQuery` |
| Triggered by user action | `useMutation` |

## Commands

```bash
# Install core + devtools
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools

# ESLint plugin (opcional)
pnpm add -D @tanstack/eslint-plugin-query@5

# Check version
pnpm list @tanstack/react-query
```

## Resources

- **Docs**: https://tanstack.com/query/v5/docs/framework/react/overview
- **Migration guide**: https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5
- **queryOptions API**: https://tanstack.com/query/v5/docs/framework/react/reference/queryOptions
- **tkdodo blog**: https://tkdodo.eu/blog/the-query-options-api
