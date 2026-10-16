import { defineConfig, type UserConfig } from 'vite';
import type { InlineConfig } from 'vitest/node';
import react from '@vitejs/plugin-react';

interface VitestConfig extends UserConfig {
  test?: InlineConfig;
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/**'],
    testTimeout: 15000,
    fileParallelism: false,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY:
        process.env.VITE_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    },
  },
} as VitestConfig);
