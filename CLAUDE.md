# AgentTrust Demo (Quality Oracle Frontend)

> Part of **assisterr-workflow**. See `../assisterr-workflow/CLAUDE.md` for full workflow, sizing, spec lifecycle, memory entities, and agent routing.

## Project Context

- **Port:** 3000 (dev), 3003 (E2E tests)
- **Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui + Recharts
- **Brand:** Laureum.ai (formerly AgentTrust)
- **Deployment:** Vercel (auto-deploy on push to main)
- **Domain:** laureum.ai
- **Backend:** Connects to quality-oracle (FastAPI, port 8002)
- **Domain agent:** `30-implement-fe` handles this repo
- **GitHub:** assister-xyz/quality-oracle-demo

## Architecture

7-page SPA with Next.js App Router:
- `/` — Dashboard (KPIs, tier distribution, recent evals, battles)
- `/evaluate` — Submit MCP server URL, live progress, 6-axis results
- `/leaderboard` — Sorted agents by score with tier badges
- `/battle` — Head-to-head arena (two agents compete)
- `/ladder` — Competitive ranking with OpenSkill ratings
- `/compare` — Side-by-side multi-agent comparison
- `/bulk` — Batch evaluation of multiple URLs

API client in `src/lib/api.ts` connects to backend via `NEXT_PUBLIC_API_URL`.

## Running Locally

```bash
npm run dev              # Start on port 3000
npm run build            # Production build
npx playwright test      # E2E tests (port 3003)
```

## Environment

```
NEXT_PUBLIC_API_URL=http://localhost:8002   # Backend URL
NEXT_PUBLIC_API_KEY=qo_...                 # API key
```

**Vercel:** Set `NEXT_PUBLIC_API_URL` to production backend URL in Vercel Dashboard.

## Quality Gates

```bash
npm run build            # Next.js compiles
npm run lint             # ESLint passes
npx playwright test      # E2E tests pass
```

## Design System

- **Primary:** Orange `#F66824` (accent, brand)
- **Fonts:** DM Sans (body), Geist Mono (numbers)
- **Components:** shadcn/ui (Card, Badge, Button, Input, Table, Tabs)
- **Charts:** Recharts (RadarChart for 6-axis)
- **Animations:** Framer Motion

## Key Paths

```
src/app/               # Next.js pages (7 routes)
src/components/        # UI components (navbar, score-gauge, tier-badge, etc.)
src/components/ui/     # shadcn/ui primitives
src/lib/api.ts         # REST API client
src/lib/hooks.ts       # React hooks (useBackendHealth, useScoresList, etc.)
src/lib/mock-data.ts   # Type definitions and tier configs
src/lib/transform.ts   # Data transformations
e2e/                   # Playwright E2E tests
```

## Forbidden Zones (Quick Reference)

| Path | Risk |
|------|------|
| `src/lib/api.ts` | Backend communication, auth headers |
| `.env.local` | API keys, backend URL |
| `src/app/layout.tsx` | Root layout, providers |
| `next.config.ts` | Build configuration |
