# S.T.R.I.D.E. Platform

A Ukrainian-language talent diagnostics platform that guides users through a 3-block cognitive assessment and generates a personalized development profile and roadmap.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/stride run dev` — run the frontend (port 23761, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5 + express-session (cookie-based auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle DB schema (users.ts, results.ts)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod validation schemas
- `artifacts/api-server/src/routes/` — Express route handlers (auth, results, admin)
- `artifacts/stride/src/` — React frontend
  - `context/AssessmentContext.tsx` — assessment state + scoring logic
  - `data/profiles.ts` — PROFILE_DATA and PROFS constants (Ukrainian content)
  - `pages/` — all page components
  - `components/Topbar.tsx` — global navigation with step dots

## Architecture decisions

- Cookie-based sessions via express-session (httpOnly cookies, 7-day expiry)
- SHA-256 password hashing with a static salt (simple, no bcrypt dependency)
- First registered user automatically becomes admin
- Results can be saved anonymously (no userId) for guest users
- All Ukrainian text is stored as constants in `src/data/profiles.ts` to stay faithful to the prototype

## Product

S.T.R.I.D.E. (Systemic Talent & Resource Integration) is a 3-step diagnostic tool:

1. **Block 1 — Когнітивний процесинг** (3 questions: 2 multiple-choice + 1 abstract thinking scale)
2. **Block 2 — Енергозатрати** (3 multiple-choice questions about motivation and work style)
3. **Block 3 — Адаптивність** (3 multiple-choice questions about resilience and autonomy)

Results are one of 4 profiles:
- Системний Архітектор — high cog + energy + adaptability
- Синтетичний Дослідник — interdisciplinary thinker
- Глибинний Спеціаліст — deep focus specialist
- Адаптивний Стратег — flexible generalist leader

The result screen has 4 tabs: Profile, Trajectory, Development Map (roadmap builder), and Profession Match.

## User preferences

- All UI text must remain in Ukrainian exactly as in the original prototype
- Color palette: accent #534AB7, teal #1D9E75, coral #D85A30, amber #BA7517
- Fonts: Syne (headings), Manrope (body), DM Mono (mono/labels)

## Gotchas

- Always run `pnpm run typecheck:libs` before typechecking leaf packages — the DB lib must be built first for declarations to be visible
- The `eq` and other Drizzle operators are re-exported from `@workspace/db` for convenience
- Sessions use `sameSite: 'none'` in production to work across proxy origins
- The custom-fetch is configured with `credentials: 'include'` for cookie-based auth

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
