import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL_TEST ||
        'postgresql://postgres:postgres@localhost:5432/lead_manager_test?schema=public',
      JWT_SECRET: 'test-jwt-secret-for-automated-tests',
      JWT_EXPIRES_IN: '1h',
    },
    setupFiles: ['./test/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallelism: false,
  },
});
