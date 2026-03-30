# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Next.js 16)
npm run build        # Production build
npm run lint         # ESLint (flat config)
npx drizzle-kit push # Push schema changes to Neon Postgres
npx drizzle-kit generate  # Generate migration files
vercel --prod        # Deploy to production
```

npm run test         # Run tests (vitest)

## Deployment

- **Platform:** Vercel
- **Production URL:** https://pointsaware.vercel.app
- **Vercel project:** `derek-xus-projects-126e1192/pointsaware`
- **Build region:** Washington, D.C. (iad1)
- **Deploy command:** `vercel --prod` (uses Vercel CLI, currently v50.25.4)
- **Cron jobs** (defined in `vercel.json`):
  - `/api/cron/check-prices` — daily at 9:00 UTC
  - `/api/cron/send-alerts` — daily at 10:00 UTC
  - `/api/cron/cleanup` — daily at 3:00 UTC

## Architecture

**PointsAware** is a flight rewards optimization SaaS. Users enter their Chase UR / Amex MR balances and the app finds the cheapest award flights via transfer partner optimization. The display name is "PointsAware" — the `pointsjet` directory name and `pj-` CSS prefix are legacy.

### Route Groups (App Router)

- `(marketing)/` — Public pages: landing (`/`), pricing (`/pricing`)
- `(auth)/` — Clerk-hosted login/signup at `/login`, `/signup`
- `(dashboard)/` — Protected routes behind Clerk auth: `/dashboard`, `/search`, `/deals`, `/alerts`, `/points`, `/settings`, `/notifications`

Each group has its own layout. The dashboard layout provides sidebar + header shell.

### Core Data Flow: Flight Search

1. User submits search → `GET /api/flights/search` with query params
2. API checks Upstash Redis cache (5 min TTL) → on miss, calls seats.aero API (`lib/services/seats-aero.ts`)
3. Results parsed into `FlightDeal` objects with cabin class, points price, airline
4. Transfer optimizer (`lib/services/transfer-optimizer.ts`) enriches results: for each flight, computes all viable Chase UR / Amex MR transfer paths and ranks by cost
5. Results rendered as boarding-pass styled flight cards (`components/flights/flight-card.tsx`)

### Key Modules

- **`lib/db/schema.ts`** — Drizzle ORM schema (8 tables: users, pointsBalances, savedSearches, alerts, flightDeals, priceHistory, notifications, transferPartners)
- **`lib/db/queries/`** — Query helpers: `users.ts` (getOrCreateDbUser from Clerk), `points.ts` (upsert balances), `searches.ts` (saved search CRUD)
- **`lib/services/seats-aero.ts`** — seats.aero API client for award flight availability (NOT cash fares). Paginates via cursor (max 10 pages). `SeatsAeroAvailability` interface is exported.
- **`lib/services/transfer-optimizer.ts`** — Core differentiator: finds cheapest points currency → airline program transfer path
- **`lib/constants/transfer-partners.ts`** — Chase UR and Amex MR partner matrices with transfer ratios and times
- **`lib/cache/index.ts`** — Upstash Redis helpers (`getCached`, `setCache`, `flightSearchCacheKey`)

### API Routes

- `GET /api/flights/search` — Award flight search (seats.aero + transfer optimizer enrichment)
- `GET /api/flights/calendar` — Monthly availability heatmap data (lowest price per date)
- `GET|PUT /api/points` — Read/update user's points balances
- `GET|POST|DELETE /api/searches` — Saved searches CRUD

### Auth

Clerk v7 with route protection in `src/proxy.ts` (NOT `middleware.ts` — Next.js 16 renamed it). Protected routes: all `/dashboard/*`, `/search/*`, `/alerts/*`, `/points/*`, `/deals/*`, `/settings/*`, `/notifications/*`, `/api/searches/*`, and their API counterparts.

### DB Client

`lib/db/index.ts` uses a Proxy for lazy initialization — the Neon connection is only created on first query, not at import time. This allows the build to succeed without `DATABASE_URL` set.

## Critical Gotchas

- **Next.js 16 uses `proxy.ts`**, not `middleware.ts`. Read `node_modules/next/dist/docs/` before touching routing or middleware.
- **shadcn v4 uses base-ui**, NOT Radix. The `asChild` prop does not exist. Apply classes directly to trigger/slot components.
- **Clerk v7 API differs** from older versions. `afterSignOutUrl` does not exist on `UserButton`. Check Clerk v7 docs before using Clerk components.
- **Tailwind v4** — config is in CSS (`globals.css`), not `tailwind.config.ts`. PostCSS plugin is `@tailwindcss/postcss`.

## Design System

Dark theme ("Midnight First Class") with forced `.dark` class. Key tokens defined in `src/app/globals.css`:
- Colors: `pj-midnight` (bg), `pj-navy` (cards), `pj-gold` (primary accent), `pj-cyan` (secondary), `pj-cream` (text)
- Fonts: Source Serif 4 (headings), Outfit (body), JetBrains Mono (mono)
- Effects: grain texture overlay (`.grain`), glow effects (`.glow-gold`, `.glow-cyan`), mesh gradients (`.mesh-card`)
- Path alias: `@/*` → `./src/*`

## Environment Variables

Required: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SEATS_AERO_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. See `.env.local` for the full list including Stripe, Resend, Twilio, Mapbox, VAPID keys.
