import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
    include: ['tests/vitest/**/*.spec.ts', 'tests/vitest/**/*.spec.tsx'],
  },
});
