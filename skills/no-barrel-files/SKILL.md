---
name: no-barrel-files
description: Avoid barrel files (index.ts re-export files) in app code. Trigger when creating an index.ts, writing re-exports, or importing from a directory instead of a file.
license: Apache-2.0
metadata:
    author: Infinitus
    version: '1.0'
    scope: [frontend, ui, api]
    auto_invoke: 'Creating index.ts, writing re-exports, importing from a folder path'
    allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Rule

**NEVER create `index.ts` files that only re-export from other files** in app code.

## Why

| Problem                                    | Effect                                     |
| ------------------------------------------ | ------------------------------------------ |
| Vite/bundler resolves longer module chains | Slower dev server cold start               |
| All exports in one entry point             | Tree-shaking becomes harder to verify      |
| TypeScript processes extra indirection     | Slower type checking                       |
| Shared re-export files                     | Common root cause of circular dependencies |

## ❌ Barrel Pattern (NEVER do this in app code)

```
src/components/card/
├── card.tsx
└── index.ts   ← ❌ just re-exports card.tsx
```

```typescript
// index.ts ❌
export { Card, CardHeader, CardContent } from './card';
export type { CardProps } from './card';

// consumer ❌ — importing a folder hides the real file
import { Card } from '@/components/card';
```

## ✅ Direct Import (ALWAYS do this)

```
src/components/card/
└── card.tsx   ← single file, import directly
```

```typescript
// consumer ✅ — explicit, no indirection
import { Card, CardHeader, CardContent } from '@/components/card/card';
```

## Decision: Is an index.ts ever valid?

```
Is this the public entry point of a published library?   → YES → index.ts is fine
Is this app-internal code?                               → NO  → import directly
```

**Valid examples of `index.ts`:**

- `proqio-ui` package entry (`dist/src/main.d.ts`) — library public API
- An npm package you are publishing — consumers need a stable entry point

**Invalid examples (remove these):**

- `src/components/index.ts` — re-exports every component
- `src/hooks/index.ts` — re-exports every hook
- `src/utils/index.ts` — re-exports every utility

## Migrating Existing Barrels

```bash
# Find barrel files (index.ts that only contain exports)
grep -rl "^export \{" src --include="index.ts"
```

For each one found:

1. Delete the `index.ts`
2. Update all imports to point to the actual file

```typescript
// Before ❌
import { useAuth } from '@/hooks';
import { formatDate } from '@/utils';

// After ✅
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/utils/format-date';
```

## File Naming Alongside No-Barrels

Since there is no `index.ts` to re-export, name files after what they export:

```
src/
├── components/
│   ├── card/
│   │   └── card.tsx          → import from '@/components/card/card'
│   └── user-avatar/
│       └── user-avatar.tsx   → import from '@/components/user-avatar/user-avatar'
├── hooks/
│   ├── use-auth.ts           → import from '@/hooks/use-auth'
│   └── use-debounce.ts       → import from '@/hooks/use-debounce'
└── utils/
    ├── format-date.ts        → import from '@/utils/format-date'
    └── cn.ts                 → import from '@/utils/cn'
```
