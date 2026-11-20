# MatchPulse API-Football Proxy

This independent Cloudflare Worker proxies the fixed API-Football v3 surface used by MatchPulse. It is not deployed by this repository change.

## Configuration

Set `API_FOOTBALL_KEY` as a Cloudflare Worker secret before deployment. For local development, copy `.dev.vars.example` to `.dev.vars` and provide a local value; never commit it. `DAILY_UPSTREAM_BUDGET` is an optional non-secret Worker variable and defaults to 80 upstream cache misses per UTC day.

The Worker accepts only the documented GET allowlist in `src/index.ts`. It does not forward client headers, arbitrary hosts, URLs, paths, or parameters. The key is sent upstream only in `x-apisports-key`.

## Controls

- Cache API entries are local to a Cloudflare data center, not globally shared. Their synthetic fixed cache-key origin is internal-only and prevents fragmentation across public Worker hostnames.
- The `DailyBudget` Durable Object atomically counts cache-miss upstream attempts and fails closed if unavailable.
- `EDGE_RATE_LIMITER` is intentionally coarse and approximate per Cloudflare location. It keys on Cloudflare's `CF-Connecting-IP`; a missing value uses the shared `unknown` bucket rather than an untrusted forwarded header. It helps reduce abuse but cannot protect the global daily API quota by itself.
- CORS is a browser interoperability policy, not authentication. A public unauthenticated mobile proxy retains abuse risk; strict allowlisting, cache policy, the Durable Object budget, and observability are required.

## Commands

`npm run typecheck`, `npm test`, `npm run dev`, and `npm run deploy` run from this directory. Do not run deployment until Cloudflare configuration and the production secret have been set separately.
