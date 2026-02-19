/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// import { visualizer } from "rollup-plugin-visualizer"; // pnpm add -D rollup-plugin-visualizer

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    // Uncomment to analyze bundle size after build (opens stats.html automatically)
    // visualizer({ open: true, gzipSize: true, filename: "stats.html" }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Each key becomes a separate cached chunk.
        // Add a new key whenever you install a large library.
        manualChunks: {
          "vendor-react":   ["react", "react-dom"],
          "vendor-query":   ["@tanstack/react-query"],
          "vendor-zustand": ["zustand"],
          "vendor-forms":   ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-ui":      ["proqio-ui"],
          // "vendor-charts": ["recharts"],       // example: add when using recharts
          // "vendor-virtual": ["@tanstack/react-virtual"], // add when using virtualization
        },
      },
    },
  },
});
