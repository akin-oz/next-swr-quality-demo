# React FE Quality Starter

[![Check](https://github.com/akin-oz/next-swr-quality-demo/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/akin-oz/next-swr-quality-demo/actions/workflows/check.yml?query=branch%3Amain) [![E2E](https://github.com/akin-oz/next-swr-quality-demo/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/akin-oz/next-swr-quality-demo/actions/workflows/e2e.yml?query=branch%3Amain) [![LHCI](https://github.com/akin-oz/next-swr-quality-demo/actions/workflows/lhci.yml/badge.svg?branch=main)](https://github.com/akin-oz/next-swr-quality-demo/actions/workflows/lhci.yml?query=branch%3Amain)

A small Next.js app that shows how to fetch data with safety and confidence. Cached responses return fast, background refresh keeps data fresh, and every error path is typed and tested. Clean domain boundaries, accessible UI states, and quality gates in CI.

## What this proves 
- Contract-first data discipline: every API response is validated at the edge (Zod) and mapped into a single error shape (AppError) before it touches the UI.
- Predictable flow: domain boundary hides transport and caching; UI renders from a simple useQuery state machine (loading | success | empty | error).
- Pragmatic UX discipline: accessible errors (role=alert + focus), background revalidation for snappy reads, and TTL cache to avoid thrash.
- Quality gates you can trust: ESLint, typecheck, unit + E2E tests in CI, and Lighthouse budgets for perf/a11y/best-practices.

## TL;DR

- Next.js 16 + React 19 + TypeScript (Node 22)
- Contracts at the edge (Zod), one error shape (AppError)
- Cache with TTL + SWR‑style revalidation (tiny `useQuery`)
- Tests: Vitest (unit), Playwright (e2e), MSW (mocks)
- A11y: Alert announces and auto‑focuses on error
- Perf: Lighthouse CI with budgets
- Storybook 8 (a11y addon) for component states
- CI: split jobs (check, e2e, lhci)

## Quickstart

```bash
npm ci
npm run check          # lint + typecheck + format:check + unit
npm run dev            # http://localhost:3000

# Optional
npm run storybook      # http://localhost:6006 (component states + a11y)
npx playwright install # first time only
npm run test:e2e       # run e2e against dev server
npm run lhci           # Lighthouse CI (requires a build + static serve)
```

## Commands
- dev: start Next.js in dev mode (port 3000)
- build: production build of the app
- start: start the built app
- lint: ESLint (Next core-web-vitals rules)
- typecheck: TypeScript project check
- format: Prettier write
- format:check: Prettier check only
- test:unit: Vitest unit tests (jsdom, MSW)
- test:e2e: Playwright tests
- storybook: Storybook dev server (port 6006)
- build-storybook: static Storybook build
- lhci: Lighthouse CI run (uses lighthouserc.json budgets)
- check: lint + typecheck + format:check + unit tests

## Architecture (Boundaries)

- Domain: `src/domain/**`
  - Hides HTTP + validation + cache from UI. Example: `src/domain/items/index.ts`.
- Contracts: `src/lib/models.ts`
  - Zod schemas, `ApiEnvelope`, `AppError` factory.
- Transport: `src/lib/http.ts`
  - Fetch wrapper with Abort, JSON/parse/HTTP/network → `AppError` mapping, optional schema validation.
- Cache/SWR: `src/lib/cache.ts`, `src/hooks/useQuery.ts`
  - In‑memory TTL store. `useQuery(key, fetcher, { ttl }|ttl)` revalidates after paint.
- UI: `src/app/**`, A11y: `src/components/Alert.tsx`
  - Pages import domain only. Alert uses role=alert, aria‑live, focus.

## Data + Error Model

- Envelope: `ApiEnvelope(z.object(...))` → `{ data: ... }` enforced per call.
- AppError: `{ type: 'network'|'http'|'parse'|'validation'|'aborted'|'unknown', message, status? }`.
- Domain functions (e.g., `listItems`, `getItem`) return fully typed values or throw `AppError`.

## Tests

- Unit (Vitest):
  - HTTP normalization (network/HTTP/parse/validation/abort)
  - Domain contract validation
  - Cache TTL + SWR revalidation
  - `useQuery` states (loading/success/empty/error) and abort on unmount
  - A11y: Alert role/live/focus
- E2E (Playwright): list → detail happy path with route‑mocked API

## Quality Gates

- Lint: `npm run lint` (Next core‑web‑vitals)
- Types: `npm run typecheck`
- Unit: `npm run test:unit`
- E2E: `npm run test:e2e`
- Format: `npm run format:check`
- Perf budgets: `npm run lhci` (see `lighthouserc.json`)
- All‑in: `npm run check`

Budgets (targets): Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90.

## Storybook

- Framework: React + Vite
- Addons: essentials, a11y
- Command: `npm run storybook`
- Example: `src/components/Alert.stories.tsx` covers error/warning/info/success.

## Folder Map

- `src/lib/models.ts` — Zod schemas, `AppError`
- `src/lib/http.ts` — fetch wrapper + normalization
- `src/lib/cache.ts` — TTL cache + SWR helper
- `src/hooks/useQuery.ts` — tiny query hook (TTL + revalidate)
- `src/domain/items/index.ts` — typed domain API
- `src/components/Alert.tsx` — accessible error surface
- `tests/**` — unit and setup; `tests/e2e/**` — Playwright

## Trade‑offs and what we intentionally skipped

- Validate at edges for safety over micro‑perf
- Tiny utilities > heavy libs for clarity
- In‑memory cache for testability over persistence
- Route‑mocked E2E for speed; full backend integration tests are out of scope
- A11y baked into failure UI from day 1

Intentionally out of scope (to stay focused on the quality signals):
- No global state management (Redux/Zustand/RTK Query). Local state + small cache are enough here.
- No endpoint auth/security hardening. Mocked/demo API only; add auth, CSRF, rate‑limits in a real app.
- No bundle size tuning or production profiling. The goal is correctness + discipline, not bytes.
- No server/shared cache (Redis/CDN) or persistence layer. Only an in‑memory TTL for clarity.
- No mutations (create/update/delete) or optimistic UI; only read/query flows.
- No error reporting/observability wiring (Sentry/OpenTelemetry). Add when productized.
- No internationalization (i18n) or localization.

## Keywords

Next.js, React 19, TypeScript, Zod, MSW, Vitest, Playwright, Storybook, Tailwind, Lighthouse CI, ESLint, Prettier, GitHub Actions, A11y, SWR, AppError.

If you have 5 minutes, read `src/lib/http.ts`, `src/lib/models.ts`, and `src/domain/items/index.ts` for the core ideas in ~200 LOC.
