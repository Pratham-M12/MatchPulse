import type { DailyBudget, Env as WorkerEnv } from '../../src/index.ts';

declare module 'cloudflare:workers' {
  interface ProvidedEnv extends WorkerEnv {
    API_FOOTBALL_KEY: string;
    DAILY_UPSTREAM_BUDGET: string;
    DAILY_BUDGET: DurableObjectNamespace<DailyBudget>;
  }
}
