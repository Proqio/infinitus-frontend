---
name: compound-components
description: Compound Component Pattern for building flexible, composable React components. Trigger when designing or building a reusable UI component that has multiple related parts, shared internal state, or requires flexible composition by consumers.
license: Apache-2.0
metadata:
  author: Infinitus
  version: "1.0"
  scope: [frontend, ui]
  auto_invoke: "Designing a reusable component with sub-parts, building a component with shared internal state, creating a component system"
  allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use vs When NOT to Use

```
Component has multiple related parts?          → YES → Compound Component
Sub-parts share implicit state?                → YES → Compound Component
Consumer needs flexible composition?           → YES → Compound Component
Component is a simple leaf (Button, Badge)?    → NO  → Simple props
Component has a single responsibility?         → NO  → Simple props
No meaningful sub-structure?                   → NO  → Simple props
```

**Examples from proqio-ui (all use this pattern):**
- `Dialog` + `DialogTrigger` + `DialogContent` + `DialogHeader` + `DialogFooter`
- `Form` + `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage`
- `Select` + `SelectTrigger` + `SelectContent` + `SelectList` + `SelectItem`
- `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`

**Counter-examples (simple props are correct):**
- `Button`, `Badge`, `Skeleton`, `Callout` — single responsibility, no sub-structure needed

## Core Pattern

```typescript
import { createContext, use, useState } from 'react';

// 1. Define context shape
interface CardContextValue {
  isExpanded: boolean;
  toggle: () => void;
}

// 2. Create context (null default forces usage check in hook)
const CardContext = createContext<CardContextValue | null>(null);

// 3. Hook to access context — throws if used outside the compound
function useCard() {
  const ctx = use(CardContext);
  if (!ctx) throw new Error('useCard must be used within <Card>');
  return ctx;
}

// 4. Root component holds shared state
function Card({ children, className }: React.ComponentPropsWithRef<'div'>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = () => setIsExpanded(prev => !prev);

  return (
    <CardContext value={{ isExpanded, toggle }}>
      <div className={cn('rounded-lg border', className)}>{children}</div>
    </CardContext>
  );
}

// 5. Sub-components consume context
function CardHeader({ children, className }: React.ComponentPropsWithRef<'div'>) {
  const { toggle } = useCard();
  return (
    <div onClick={toggle} className={cn('flex cursor-pointer p-4', className)}>
      {children}
    </div>
  );
}

function CardContent({ children, className }: React.ComponentPropsWithRef<'div'>) {
  const { isExpanded } = useCard();
  if (!isExpanded) return null;
  return <div className={cn('p-4', className)}>{children}</div>;
}

// 6. Named exports — no barrel files, no static properties
export { Card, CardHeader, CardContent };
export type { CardContextValue };
```

## TypeScript: Typing Sub-Components

```typescript
// ✅ Extend native element props with specific additions
interface CardHeaderProps extends React.ComponentPropsWithRef<'div'> {
  icon?: React.ReactNode;
}

function CardHeader({ icon, children, className }: CardHeaderProps) {
  const { toggle } = useCard();
  return (
    <div onClick={toggle} className={cn('flex items-center gap-2 p-4', className)}>
      {icon}
      {children}
    </div>
  );
}
```

## Context: use() in React 19

```typescript
// ✅ React 19: use() — reads context, works in conditionals
const ctx = use(CardContext);

// ✅ Still valid alternative
const ctx = useContext(CardContext);
```

## Controlled vs Uncontrolled

Expose both modes so the consumer can choose:

```typescript
interface CardProps extends React.ComponentPropsWithRef<'div'> {
  defaultExpanded?: boolean;   // uncontrolled
  expanded?: boolean;           // controlled
  onExpandedChange?: (expanded: boolean) => void;
}

function Card({ defaultExpanded = false, expanded, onExpandedChange, children, className }: CardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;

  const toggle = () => {
    if (!isControlled) setInternalExpanded(prev => !prev);
    onExpandedChange?.(!isExpanded);
  };

  return (
    <CardContext value={{ isExpanded, toggle }}>
      <div className={cn('rounded-lg border', className)}>{children}</div>
    </CardContext>
  );
}
```

## Consumer Usage

```typescript
// ✅ Import directly from the source file — no barrel
import { Card, CardHeader, CardContent } from '@/components/card/card';

// Uncontrolled
<Card defaultExpanded>
  <CardHeader icon={<FolderIcon />}>Documents</CardHeader>
  <CardContent>File list here</CardContent>
</Card>

// Controlled
<Card expanded={isOpen} onExpandedChange={setIsOpen}>
  <CardHeader>Settings</CardHeader>
  <CardContent>Settings content</CardContent>
</Card>
```

## File Structure

```
src/components/card/
└── card.tsx    # Root + sub-components + context + hook — all in one file
```

All related pieces live in one file. Import directly from it — no `index.ts` needed.

## Rules

- **NEVER** put all logic in the root and pass via props — that defeats the pattern
- **NEVER** expose Context directly — only expose the hook (`useCard`)
- **ALWAYS** throw a descriptive error in the hook when used outside the provider
- **NEVER** use `forwardRef` — in React 19, `ref` is just a prop
- **ALWAYS** use `React.ComponentPropsWithRef<'element'>` to extend native element props
- **NEVER** attach sub-components as static properties (`Card.Header = CardHeader`) — use named exports
- **NEVER** create an `index.ts` barrel to re-export — import directly from `card.tsx`
