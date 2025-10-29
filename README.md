# React FE Quality Starter

Prove habits, not size. Tiny, production‑like, testable.

## TL;DR (Signals)

- Next.js 16 + React 19 + TypeScript (Node 20)
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

## Folder Map (scan‑friendly)

- `src/lib/models.ts` — Zod schemas, `AppError`
- `src/lib/http.ts` — fetch wrapper + normalization
- `src/lib/cache.ts` — TTL cache + SWR helper
- `src/hooks/useQuery.ts` — tiny query hook (TTL + revalidate)
- `src/domain/items/index.ts` — typed domain API
- `src/components/Alert.tsx` — accessible error surface
- `tests/**` — unit and setup; `tests/e2e/**` — Playwright

## Design Trade‑offs (concise)

- Validate at edges for safety over micro‑perf
- Tiny utilities > heavy libs for clarity
- In‑memory cache for testability over persistence
- Route‑mocked e2e for speed; integration is out‑of‑scope
- A11y baked into failure UI from day 1

## Keywords

Next.js, React 19, TypeScript, Zod, MSW, Vitest, Playwright, Storybook, Tailwind, Lighthouse CI, ESLint, Prettier, GitHub Actions, A11y, SWR, AppError.

If you have 5 minutes, read `src/lib/http.ts`, `src/lib/models.ts`, and `src/domain/items/index.ts` for the core ideas in ~200 LOC.
