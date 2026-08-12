import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const webRoot = fileURLToPath(new URL('./apps/web', import.meta.url));
const shared = fileURLToPath(new URL('./packages/shared/src/index.ts', import.meta.url));

export default defineConfig({
  root: webRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@caseverse/shared': shared,
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./apps/web/dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
});
