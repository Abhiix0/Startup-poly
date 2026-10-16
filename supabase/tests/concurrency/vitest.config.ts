import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['supabase/tests/concurrency/**/*.test.ts'], testTimeout: 120_000, fileParallelism: false },
});
