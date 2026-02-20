/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']],
            },
        }),
        tailwindcss(),
        // visualizer({ open: true, gzipSize: true, filename: "stats.html" }),
    ],
    build: {
        rollupOptions: {
            output: {
                // Separate vendor chunks so the browser caches libraries independently
                // from app code. Users only re-download your code when you ship fixes.
                // Add a new key whenever you install a large library.
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-router': ['@tanstack/react-router'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-zustand': ['zustand'],
                    'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
                    'vendor-ui': ['proqio-ui'],
                },
            },
        },
    },
});
