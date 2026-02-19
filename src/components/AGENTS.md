# Components Agent Guide

## Core Rule

**ALWAYS use proqio-ui components. NEVER build custom versions of components that already exist in the library.**

Load the `proqio-ui` skill before building or modifying any UI component:

```
invoke skill: proqio-ui
```

---

## When to Use proqio-ui vs Custom Components

| Situation | Action |
|-----------|--------|
| Button, input, checkbox, switch, radio | proqio-ui — always |
| Modal, dialog, alert dialog | proqio-ui — always |
| Dropdown menu, context menu, popover | proqio-ui — always |
| Tooltip | proqio-ui — always |
| Select / combobox with search | proqio-ui `Select` — always |
| Data table | proqio-ui `Table` — always |
| Status label / chip | proqio-ui `Badge` — always |
| Inline alert / notification | proqio-ui `Callout` — always |
| Date picker | proqio-ui `Datepicker` — always |
| Side navigation | proqio-ui `Sidebar` — always |
| Tabs | proqio-ui `Tabs` — always |
| Progress bar | proqio-ui `LinearProgress` — always |
| Multi-step wizard | proqio-ui `Stepper` — always |
| Empty content state | proqio-ui `EmptyState` — always |
| Loading placeholder | proqio-ui `Skeleton` — always |
| Breadcrumbs | proqio-ui `Breadcrumb` — always |
| Form fields + validation | proqio-ui `Form` + `FormField` + react-hook-form |
| Accordion / collapsible | proqio-ui `Accordion` / `Collapsible` |
| Layout-only wrapper (no interactive) | Custom component OK |
| Business-logic-specific compound UI | Custom component using proqio-ui primitives |

---

## Component File Conventions

```
src/components/
├── {feature}/           # Feature-scoped components
│   ├── ComponentName.tsx
│   └── index.ts
└── ui/                  # Shared wrappers (only if proqio-ui needs project-specific config)
```

**Rules:**
- One component per file, named identically to the export
- Use named exports — no default exports
- Props interface name: `{ComponentName}Props`
- Co-locate tests in `src/tests/` mirroring this structure

---

## Import Pattern

```typescript
// ✅ Always import from proqio-ui directly
import { Button, Dialog, DialogContent, TextField } from 'proqio-ui';

// ✅ Compose proqio-ui in local components
export function DeleteResourceDialog({ onConfirm }: DeleteResourceDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button intent="danger" variant="outline">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete resource?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## CSS Setup (Read Before Styling)

proqio-ui styles come from **Tailwind 4 scanning**, NOT a separate CSS import. The setup lives in `src/index.css`:

```css
@import "tailwindcss";
@import 'proqio-ui/theme.css';              /* CSS tokens — REQUIRED */
@source '../node_modules/proqio-ui/dist';   /* Tailwind class scan — REQUIRED */
```

- **Never** import `proqio-ui/style.css` — that file does not exist
- **Never** remove `@source` — Tailwind will purge all proqio-ui component classes
- **Never** remove `@import 'proqio-ui/theme.css'` — components will lose all colors and spacing

**Known conflict:** `src/index.css` has a global `button {}` rule that overrides proqio-ui Button styles. If buttons look wrong, those global rules need to be removed.

---

## Auto-invoke Skills

| Action | Skill |
|--------|-------|
| Using any proqio-ui component | `proqio-ui` |
| Writing React components | `react-19` |
| Working with Tailwind classes | `tailwind-4` |
| Writing TypeScript types | `typescript` |
| Implementing or modifying component | `tdd` |

---

## Skills Reference

- **proqio-ui**: [../../skills/proqio-ui/SKILL.md](../../skills/proqio-ui/SKILL.md) — All components, variants, compound patterns
- **react-19**: [../../skills/react-19/SKILL.md](../../skills/react-19/SKILL.md) — No useMemo/useCallback, React 19 patterns
- **tailwind-4**: [../../skills/tailwind-4/SKILL.md](../../skills/tailwind-4/SKILL.md) — cn(), no var() in className
- **tdd**: [../../skills/tdd/SKILL.md](../../skills/tdd/SKILL.md) — Test-first workflow
