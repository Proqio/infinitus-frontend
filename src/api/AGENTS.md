# API Agent Guide

## Core Rule

**All server state lives here. Never use `useState` + `useEffect` + `fetch` to load remote data. Always use TanStack Query v5.**

Load the `tanstack-5` skill before creating or modifying anything in this folder:

```
invoke skill: tanstack-5
```

---

## Folder Structure

```
src/api/
├── fetchers/          # Raw fetch functions — no query logic, no hooks
│   └── resource-name.ts
├── queries/           # queryOptions definitions + key factories
│   └── resource-name.ts
└── mutations/         # mutationOptions definitions (only when reused across components)
    └── resource-name.ts
```

**One file per resource** (e.g. `users.ts`, `scans.ts`). Never mix resources in the same file.

---

## Layer Responsibilities

| Layer | What it does | What it must NOT do |
|-------|-------------|---------------------|
| `fetchers/` | HTTP call, request shaping, response parsing | Import TanStack hooks, hold state |
| `queries/` | Define `queryOptions` + key factories | Call `fetch` directly, render anything |
| `mutations/` | Define `mutationOptions` for reuse | Import component-level state |

---

## Required Patterns

### Key factory (every resource needs one)

```typescript
// src/api/queries/users.ts
export const userKeys = {
  all: () => ['users'] as const,
  lists: () => [...userKeys.all(), 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all(), 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### `queryOptions` — define once, reuse everywhere

```typescript
import { queryOptions } from '@tanstack/react-query';
import { fetchUsers, fetchUser } from '../fetchers/users';

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

### `mutationOptions` — only when mutation is reused

```typescript
// src/api/mutations/users.ts
import { mutationOptions } from '@tanstack/react-query';
import { patchUser } from '../fetchers/users';

export const userMutations = {
  update: () =>
    mutationOptions({
      mutationKey: ['users', 'update'],
      mutationFn: (payload: UpdateUserPayload) => patchUser(payload),
    }),
};
```

### Raw fetcher

```typescript
// src/api/fetchers/users.ts
export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
  return res.json() as Promise<User>;
}
```

---

## Consuming in Components

```typescript
// ✅ useQuery for component-owned loading/error UI
const { data, isPending, error } = useQuery(userQueries.detail(userId));

// ✅ useSuspenseQuery when parent has <Suspense> + <ErrorBoundary>
const { data } = useSuspenseQuery(userQueries.detail(userId));

// ✅ useMutation with cache invalidation
const queryClient = useQueryClient();
const updateUser = useMutation({
  ...userMutations.update(),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: userKeys.all() });
    queryClient.setQueryData(userQueries.detail(data.id).queryKey, data);
  },
});
```

---

## useQuery vs useSuspenseQuery

| Scenario | Hook |
|----------|------|
| Component handles its own loading/error UI | `useQuery` |
| Parent `<Suspense>` + `<ErrorBoundary>` exist | `useSuspenseQuery` |
| Multiple parallel queries | `useSuspenseQueries` |
| Paginated / infinite list | `useInfiniteQuery` |
| Triggered by user action | `useMutation` |

---

## What NOT to Do

```typescript
// ❌ NEVER: useState + useEffect for remote data
const [users, setUsers] = useState([]);
useEffect(() => {
  fetch('/api/users').then(r => r.json()).then(setUsers);
}, []);

// ❌ NEVER: onSuccess/onError on useQuery (removed in v5)
useQuery({ queryKey: ['x'], queryFn: fetchX, onSuccess: () => {} });

// ❌ NEVER: inline queryKey strings in components
useQuery({ queryKey: ['users', id], queryFn: () => fetchUser(id) });
// Use userQueries.detail(id) instead

// ❌ NEVER: v4 positional arguments
useQuery(['users'], fetchUsers);
```

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating or modifying any file in `src/api/` | `tanstack-5` |
| Creating Zod schemas to validate API responses | `zod-4` |
| Writing TypeScript types for request/response shapes | `typescript` |
| Fixing bug | `tdd` |
| Implementing feature | `tdd` |
| Refactoring code | `tdd` |
| Creating index.ts, writing re-exports, importing from a folder path | `no-barrel-files` |

---

## Skills Reference

- **tanstack-5**: [../../skills/tanstack-5/SKILL.md](../../skills/tanstack-5/SKILL.md) — queryOptions, mutations, infinite queries, v5 patterns
- **zod-4**: [../../skills/zod-4/SKILL.md](../../skills/zod-4/SKILL.md) — Response validation schemas
- **typescript**: [../../skills/typescript/SKILL.md](../../skills/typescript/SKILL.md) — Request/response types
- **tdd**: [../../skills/tdd/SKILL.md](../../skills/tdd/SKILL.md) — Test-first workflow
