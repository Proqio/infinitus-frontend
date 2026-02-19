import { useState } from "react";
import { Button } from "proqio-ui";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <header className="flex items-center gap-6">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="h-16 w-16" alt="React logo" />
        </a>
      </header>

      <h1 className="text-4xl font-bold">Vite + React</h1>

      <section className="flex flex-col items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 px-10 py-8">
        <Button
          variant="primary"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
        <p className="text-sm text-slate-400">
          Edit{" "}
          <code className="rounded bg-slate-700 px-1.5 py-0.5 text-xs">
            src/App.tsx
          </code>{" "}
          and save to test HMR
        </p>
      </section>

      <footer className="text-sm text-slate-400">
        Click on the Vite and React logos to learn more
      </footer>
    </main>
  );
}

export default App;
