import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Tests that shell out to GDAL, WhiteboxTools or GRASS carry the 'tools'
    // tag and are excluded from the default run, which must stay under the
    // 60 s budget in docs/harness.md. CI runs them nightly.
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      include: ['src/**/*.ts'],
    },
  },
});
