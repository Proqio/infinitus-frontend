---
name: react-compiler
description: React Compiler (build-time optimizer) patterns, Rules of React, and best practices for React 19. Trigger when enabling React Compiler, migrating away from manual memoization, debugging compilation errors, or writing components that must be compiler-compatible.
license: Apache-2.0
metadata:
    author: Infinitus
    version: '1.0'
    scope: [frontend]
    auto_invoke: 'Optimizing React components, enabling React Compiler, migrating manual memoization'
    allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## What React Compiler Does

React Compiler is a **build-time tool** that automatically memoizes components and hooks. It:

- Eliminates the need for `useMemo`, `useCallback`, and `React.memo` in new code
- Generates fine-grained re-render skipping at compile time
- Works with React 17, 18, and 19 (with a compatibility shim for 17/18)
- Requires your code to follow the **Rules of React**

## Rules of React (REQUIRED for Compiler)

The compiler only optimizes code it can prove is correct. Violating these rules causes the compiler to skip that file.

### 1. Components and hooks must be pure

```typescript
// ✅ Same inputs → same output, no side effects during render
function UserCard({ user }) {
  const formatted = formatName(user.name); // pure derivation
  return <div>{formatted}</div>;
}

// ❌ Side effect during render
function BadComponent({ id }) {
  logAnalytics(id); // runs every render — move to useEffect
  return <div>{id}</div>;
}
```

### 2. Never mutate props, state, or values passed to JSX

```typescript
// ✅ Create new array instead of mutating
function SortedList({ items }) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return <List items={sorted} />;
}

// ❌ Mutating props breaks compiler assumptions
function BrokenSort({ items }) {
  items.sort((a, b) => a.name.localeCompare(b.name)); // mutates prop!
  return <List items={items} />;
}
```

### 3. Only call hooks at the top level

```typescript
// ✅ Hooks always at top level
function Form() {
    const [value, setValue] = useState('');
    const [error, setError] = useState(null);
    // ...
}

// ❌ Hooks inside conditions/loops — compiler will skip this file
function BrokenForm({ isEditing }) {
    if (isEditing) {
        const [value, setValue] = useState(''); // ILLEGAL
    }
}
```

### 4. Never call component functions directly

```typescript
// ✅ Use JSX
return <UserCard user={user} />;

// ❌ Direct call bypasses React's reconciler
return UserCard({ user }); // compiler cannot optimize
```

---

## No Manual Memoization (New Code)

With React Compiler active, **do not add** `useMemo`, `useCallback`, or `React.memo` in new code.

```typescript
// ✅ Compiler memoizes this automatically
function ProductList({ products, onSelect }) {
  const active = products.filter(p => p.inStock);

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  return (
    <ul>
      {active.map(p => (
        <ProductItem key={p.id} product={p} onSelect={handleSelect} />
      ))}
    </ul>
  );
}

// ❌ Redundant — compiler already does this
function ProductList({ products, onSelect }) {
  const active = useMemo(() => products.filter(p => p.inStock), [products]);
  const handleSelect = useCallback((id: string) => onSelect(id), [onSelect]);
  // ...
}
```

### Existing memoization: leave in place

```typescript
// ✅ Safe to keep — compiler works alongside manual memo
// Remove only after verifying behavior with React DevTools
const result = useMemo(() => heavyCalc(input), [input]);
```

---

## Valid Escape Hatches

Some `useMemo`/`useCallback` usage remains correct even with the compiler:

### Stabilize effect dependencies

```typescript
// ✅ Needed: prevents effect from re-running on every render
function Dashboard({ filters }) {
    const query = useMemo(() => buildQuery(filters), [filters]);

    useEffect(() => {
        fetchData(query);
    }, [query]); // stable reference required here
}
```

### Expensive computations with explicit control

```typescript
// ✅ Acceptable: compiler memoizes too, but being explicit is fine
// for calculations that are genuinely expensive and well-understood
const chart = useMemo(() => computeD3Layout(data), [data]);
```

---

## Opting Out of Compilation

Use `"use no memo"` to exclude a single component or hook when the compiler produces incorrect behavior:

```typescript
function ProblematicComponent() {
    'use no memo'; // compiler skips this function only
    // ... component with unusual patterns
}
```

> Only use this as a temporary escape hatch while filing a bug report.

---

## Detecting Compiler-Incompatible Code

Run the compiler's static checker before enabling it:

```bash
# Dry-run: list files that would be skipped
npx react-compiler-healthcheck

# Check a specific file
npx react-compiler-healthcheck --target=src/components/MyComponent.tsx
```

Files are skipped (not broken) when the compiler can't verify safety. Skipped files still work — they just aren't optimized.

---

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler', {}]],
            },
        }),
    ],
});
```

---

## Decision Table

| Situation                      | Action                                             |
| ------------------------------ | -------------------------------------------------- |
| New component / hook           | Write without `useMemo`/`useCallback`              |
| Existing memoized code         | Leave as-is; remove only after DevTools validation |
| Effect fires on every render   | Use `useMemo`/`useCallback` for the dep            |
| Compiler skips your file       | Check Rules of React violations with healthcheck   |
| Compiler produces wrong output | Add `"use no memo"`, file a bug                    |
| Third-party lib not compiled   | Library still works; compiler optimizes your code  |

---

## Resources

- **React Compiler Docs**: https://react.dev/learn/react-compiler/introduction
- **Rules of React**: https://react.dev/reference/rules
- **Incremental Adoption**: https://react.dev/learn/react-compiler/incremental-adoption
- **Debugging Guide**: https://react.dev/learn/react-compiler/debugging
