# Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms. Infinitus is a monorepo with several components.
- Each component has an `AGENTS.md` file with specific guidelines (e.g., `api/AGENTS.md`, `ui/AGENTS.md`).
- Component docs override this file when guidance conflicts.

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills

| Skill            | Description                                                                                            | URL                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `typescript`     | Const types, flat interfaces, utility types                                                            | [SKILL.md](skills/typescript/SKILL.md)     |
| `react-19`       | No useMemo/useCallback, React Compiler                                                                 | [SKILL.md](skills/react-19/SKILL.md)       |
| `react-compiler` | Rules of React, build-time memoization, compiler migration                                             | [SKILL.md](skills/react-compiler/SKILL.md) |
| `tailwind-4`     | cn() utility, no var() in className                                                                    | [SKILL.md](skills/tailwind-4/SKILL.md)     |
| `tanstack-5`     | queryOptions, useQuery, useMutation, useSuspenseQuery, infinite queries (v5)                           | [SKILL.md](skills/tanstack-5/SKILL.md)     |
| `playwright`     | Page Object Model, MCP workflow, selectors                                                             | [SKILL.md](skills/playwright/SKILL.md)     |
| `zod-4`          | New API (z.email(), z.uuid())                                                                          | [SKILL.md](skills/zod-4/SKILL.md)          |
| `zustand-5`      | Persist, selectors, slices                                                                             | [SKILL.md](skills/zustand-5/SKILL.md)      |
| `vitest`         | Unit testing, React Testing Library                                                                    | [SKILL.md](skills/vitest/SKILL.md)         |
| `tdd`            | Test-Driven Development workflow                                                                       | [SKILL.md](skills/tdd/SKILL.md)            |
| `performance`    | Lazy loading, code splitting, Vite chunks, TanStack Query staleTime, Zustand selectors, virtualization | [SKILL.md](skills/performance/SKILL.md)    |

### Infinitus-Specific Skills

| Skill           | Description                                                                                     | URL                                       |
| --------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `proqio-ui`     | Proqio UI component library — all 36+ components, variants, compound patterns, form integration | [SKILL.md](skills/proqio-ui/SKILL.md)     |
| `skill-creator` | Create new AI agent skills                                                                      | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync`    | Create/modify new AI agent skills                                                               | [SKILL.md](skills/skill-creator/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                                                                                        | Skill                 |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Adding virtualization to long lists or tables                                                                                 | `performance`         |
| Configuring Vite build                                                                                                        | `performance`         |
| Creating API hooks or data fetching                                                                                           | `tanstack-5`          |
| Creating Zod schemas                                                                                                          | `zod-4`               |
| Creating forms, using useForm, using FormField or FormControl, handling form submission, form validation, form with proqio-ui | `react-hook-form`     |
| Creating index.ts, writing re-exports, importing from a folder path                                                           | `no-barrel-files`     |
| Creating new pages or routes                                                                                                  | `performance`         |
| Creating new pages or routes                                                                                                  | `tanstack-router`     |
| Designing a reusable component with sub-parts, building a component with shared internal state, creating a component system   | `compound-components` |
| Fetching data from API                                                                                                        | `tanstack-5`          |
| Fixing bug                                                                                                                    | `tdd`                 |
| Implementing feature                                                                                                          | `tdd`                 |
| Managing server state                                                                                                         | `tanstack-5`          |
| Modifying component                                                                                                           | `tdd`                 |
| Navigating between pages                                                                                                      | `tanstack-router`     |
| Optimizing React components, enabling React Compiler, migrating manual memoization                                            | `react-compiler`      |
| Optimizing bundle size or build configuration                                                                                 | `performance`         |
| Optimizing frontend performance                                                                                               | `performance`         |
| Reading URL params or search params                                                                                           | `tanstack-router`     |
| Refactoring code                                                                                                              | `tdd`                 |
| Setting up routing                                                                                                            | `tanstack-router`     |
| Using Link or useNavigate                                                                                                     | `tanstack-router`     |
| Using Zustand stores                                                                                                          | `zustand-5`           |
| Using proqio-ui components, building UI components, importing from proqio-ui                                                  | `proqio-ui`           |
| Using useQuery or useMutation                                                                                                 | `tanstack-5`          |
| Working on task                                                                                                               | `tdd`                 |
| Working with Tailwind classes                                                                                                 | `tailwind-4`          |
| Writing Playwright E2E tests                                                                                                  | `playwright`          |
| Writing React components                                                                                                      | `react-19`            |
| Writing TypeScript types/interfaces                                                                                           | `typescript`          |

---

## Project Overview

Infinitus is an open-source cloud security assessment tool supporting AWS, Azure, GCP, Kubernetes, GitHub, M365, and more.
| Component | Location | Tech Stack |
|-----------|----------|------------|
| FRONTEND | `src/` | React 19, Tailwind 4, Typescript, Zod, Zustand |
| API | `src/api` | Tanstack, Zustand |
| UI | `src/components` | React 19, Tailwind 4, Typescript |
| TEST | `src/tests` | Vitest, React Testing Library |

---

## Commit & Pull Request Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

Before creating a PR:

1. Complete checklist in `.github/pull_request_template.md`
2. Run all relevant tests and linters
3. Link screenshots for UI changes
