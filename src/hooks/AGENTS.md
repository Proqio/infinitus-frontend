# Hooks Agent Guide

## Core Rule

**Hooks in `src/hooks/` are for general app-wide logic only. API hooks go in `src/api/`. Feature-specific hooks stay co-located with their component.**

---

## Where Does a Hook Belong?

| Hook type | Location |
|-----------|----------|
| Fetches data from an API endpoint | `src/api/` — always (TanStack Query) |
| Encapsulates UI state shared across multiple unrelated components | `src/hooks/` |
| Wraps a browser API (scroll, resize, clipboard, media query) | `src/hooks/` |
| Used only by one component or one feature | Co-locate next to the component file |
| Derives state from a Zustand store | `src/hooks/` only if reused by 2+ features |

**Rule of thumb:** if the hook is only used in one place, keep it there. Extract to `src/hooks/` only when a second consumer appears.

---

## File Conventions

```
src/hooks/
└── use-kebab-case.ts     # one hook per file
```

**Rules:**

- Filename in kebab-case prefixed with `use-` (`use-media-query.ts`)
- One hook per file
- Named export — no default exports
- Return type must be explicitly typed
- No `index.ts` barrel files — import directly from the source file

```typescript
// ✅ use-media-query.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

---

## React 19 Hook Rules

```typescript
// ✅ Named imports only
import { useState, useEffect, useRef } from 'react';

// ❌ NEVER default import
import React from 'react';
```

```typescript
// ✅ No manual memoization — React Compiler handles it
export function useFilteredList<T>(items: T[], predicate: (item: T) => boolean): T[] {
  const filtered = items.filter(predicate);
  return filtered;
}

// ❌ NEVER useMemo/useCallback inside hooks
const filtered = useMemo(() => items.filter(predicate), [items, predicate]);
```

```typescript
// ✅ Use use() to read context conditionally or unwrap promises
import { use } from 'react';

function useConditionalTheme(enabled: boolean) {
  if (enabled) {
    return use(ThemeContext);
  }
  return null;
}
```

---

## What NOT to Put Here

- Hooks that call `useQuery` / `useMutation` → belong in `src/api/`
- Hooks that only exist to split a large component → keep them co-located
- Hooks that wrap a single Zustand store selector with no extra logic → use the selector directly

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating a hook | `react-19` |
| Writing TypeScript types or return types | `typescript` |
| Fetching data inside a hook | `tanstack-5` |
| Using Zustand inside a hook | `zustand-5` |
| Fixing bug | `tdd` |
| Implementing feature | `tdd` |
| Refactoring code | `tdd` |
| Creating index.ts, writing re-exports, importing from a folder path | `no-barrel-files` |

---

## Skills Reference

- **react-19**: [../../skills/react-19/SKILL.md](../../skills/react-19/SKILL.md) — No useMemo/useCallback, React Compiler, named imports
- **typescript**: [../../skills/typescript/SKILL.md](../../skills/typescript/SKILL.md) — Explicit return types, utility types
- **tanstack-5**: [../../skills/tanstack-5/SKILL.md](../../skills/tanstack-5/SKILL.md) — For hooks that fetch data
- **zustand-5**: [../../skills/zustand-5/SKILL.md](../../skills/zustand-5/SKILL.md) — For hooks that read store state
- **tdd**: [../../skills/tdd/SKILL.md](../../skills/tdd/SKILL.md) — Test-first workflow
