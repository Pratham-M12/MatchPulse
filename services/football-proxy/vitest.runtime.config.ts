import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
      miniflare: {
        bindings: {
          API_FOOTBALL_KEY: 'runtime-test-key',
          DAILY_UPSTREAM_BUDGET: '2',
        },
      },
    }),
  ],
  test: { include: ['test/runtime/**/*.test.ts'] },
});
