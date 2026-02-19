# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## AI Coding Assistants Setup

This project includes a set of **AI Skills** — instructions and patterns that teach AI coding assistants (Claude Code, Gemini CLI, Codex, GitHub Copilot) how to follow the project's conventions, use the right libraries, and generate consistent code.

Skills cover things like: TanStack Query v5 patterns, Zustand 5 selectors, Tailwind 4 utilities, Zod 4 schemas, React 19 + Compiler rules, TypeScript strict patterns, TDD workflow, and more.

**Run the setup script once after cloning:**

```bash
./skills/setup.sh
```

This creates the config files each AI assistant needs to load the skills:

| Assistant      | What gets created                       |
| -------------- | --------------------------------------- |
| Claude Code    | `.claude/skills/` symlink + `CLAUDE.md` |
| Gemini CLI     | `.gemini/skills/` symlink + `GEMINI.md` |
| Codex (OpenAI) | `.codex/skills/` symlink                |
| GitHub Copilot | `.github/copilot-instructions.md`       |

You can also configure only the assistants you use:

```bash
./skills/setup.sh --claude          # Claude Code only
./skills/setup.sh --claude --codex  # Multiple assistants
./skills/setup.sh --all             # All assistants
```

All generated files are gitignored — each developer runs the script locally for their own tools. The source of truth is `AGENTS.md` and the `skills/` directory, both of which are tracked in the repo.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...

            // Remove tseslint.configs.recommended and replace with this
            tseslint.configs.recommendedTypeChecked,
            // Alternatively, use this for stricter rules
            tseslint.configs.strictTypeChecked,
            // Optionally, add this for stylistic rules
            tseslint.configs.stylisticTypeChecked,

            // Other configs...
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...
            // Enable lint rules for React
            reactX.configs['recommended-typescript'],
            // Enable lint rules for React DOM
            reactDom.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```
