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
- **`lib/db/queries/`** — Query helpers: `users.ts` (getOrCreateDbUser, updateUserSubscription, updateUserPreferences), `points.ts` (atomic upsert balances), `searches.ts` (saved search CRUD), `alerts.ts` (alert CRUD + active alert queries), `notifications.ts` (notification CRUD + unread count), `price-history.ts` (price recording + trend detection + cleanup), `deals.ts` (recent deals + user-specific deals)
- **`lib/services/seats-aero.ts`** — seats.aero API client for award flight availability (NOT cash fares)
- **`lib/services/transfer-optimizer.ts`** — Core differentiator: finds cheapest points currency → airline program transfer path
- **`lib/constants/transfer-partners.ts`** — Chase UR and Amex MR partner matrices with transfer ratios and times
- **`lib/cache/index.ts`** — Upstash Redis helpers (`getCached`, `setCache`, `flightSearchCacheKey`)

### Key Services

- **`lib/services/alert-monitor.ts`** — Evaluates alerts against current deals; triggers notifications with 6-hour throttle
- **`lib/services/notifications.ts`** — Unified notification dispatcher: routes to email (Resend), in-app, web push, SMS (Twilio)
- **`lib/services/email.ts`** — Resend email sender with branded HTML templates (alert + digest). Lazy-init.
- **`lib/services/stripe.ts`** — Stripe checkout, portal, webhook event parsing. Lazy-init.
- **`lib/services/web-push.ts`** — VAPID-based web push notifications. Lazy-init.
- **`lib/services/sms.ts`** — Twilio SMS sending. Lazy-init.
- **`lib/services/tier-limits.ts`** — Subscription tier config (free/pro/premium limits, channel access, history days)
- **`lib/services/rate-limiter.ts`** — Redis-based sliding window rate limiter

### API Routes

- `GET /api/flights/search` — Award flight search (seats.aero + transfer optimizer enrichment)
- `GET /api/flights/calendar` — Monthly availability heatmap data (lowest price per date)
- `GET|PUT /api/points` — Read/update user's points balances
- `GET|POST|DELETE /api/searches` — Saved searches CRUD
- `GET|POST|PUT|DELETE /api/alerts` — Alert CRUD (create, list with active count, toggle, delete)
- `GET|PUT|DELETE /api/notifications` — Notification list (paginated), mark read/all, delete
- `GET /api/notifications/unread-count` — Unread count for header badge (polled every 30s)
- `GET /api/cron/check-prices` — Cron: fetch latest award prices for active alerts, record to price_history
- `GET /api/cron/send-alerts` — Cron: evaluate active alerts against latest deals, dispatch notifications
- `GET /api/cron/cleanup` — Cron: purge old price history, expired deals, read notifications
- `GET /api/cron/daily-digest` — Cron: send morning digest email to users with dailyDigest enabled
- `POST /api/stripe/checkout` — Create Stripe checkout session for subscription
- `POST /api/stripe/portal` — Create Stripe customer portal session
- `POST /api/webhooks/stripe` — Stripe webhook (NO Clerk auth, signature-verified)
- `POST /api/push/subscribe` — Save web push subscription
- `POST /api/push/unsubscribe` — Clear web push subscription
- `GET /api/flights/price-history` — Price history + trend insight (tier-limited days)
- `GET /api/deals` — Deals matching user's saved searches
- `GET|PUT /api/user/preferences` — User settings (homeAirport, notificationPrefs, phone)

### Auth

Clerk v7 with route protection in `src/proxy.ts` (NOT `middleware.ts` — Next.js 16 renamed it). Protected routes: all `/dashboard/*`, `/search/*`, `/alerts/*`, `/points/*`, `/deals/*`, `/settings/*`, `/notifications/*`, `/api/searches/*`, and their API counterparts.

### DB Client

`lib/db/index.ts` uses a Proxy for lazy initialization — the Neon connection is only created on first query, not at import time. This allows the build to succeed without env vars set. All external clients (Resend, Stripe, Twilio, web-push) use the same lazy-init pattern.

## Critical Gotchas

- **Next.js 16 uses `proxy.ts`**, not `middleware.ts`. Read `node_modules/next/dist/docs/` before touching routing or middleware.
- **shadcn v4 uses base-ui**, NOT Radix. The `asChild` prop does not exist. Apply classes directly to trigger/slot components.
- **Clerk v7 API differs** from older versions. `afterSignOutUrl` does not exist on `UserButton`. Check Clerk v7 docs before using Clerk components.
- **Tailwind v4** — config is in CSS (`globals.css`), not `tailwind.config.ts`. PostCSS plugin is `@tailwindcss/postcss`.
- **base-ui Select `onValueChange`** passes `string | null`, not `string`. Always guard: `onValueChange={(v) => v && setter(v)}`.
- **Lazy-init pattern for external clients** (DB, Resend) — never instantiate at module scope with `process.env`. Use lazy getter so builds succeed without env vars and tests can mock modules.
- **Cron routes use `CRON_SECRET`** header auth, NOT Clerk. They are intentionally excluded from the Clerk route matcher in `proxy.ts`.

## Design System

Dark theme ("Midnight First Class") with forced `.dark` class. Key tokens defined in `src/app/globals.css`:
- Colors: `pj-midnight` (bg), `pj-navy` (cards), `pj-gold` (primary accent), `pj-cyan` (secondary), `pj-cream` (text)
- Fonts: Source Serif 4 (headings), Outfit (body), JetBrains Mono (mono)
- Effects: grain texture overlay (`.grain`), glow effects (`.glow-gold`, `.glow-cyan`), mesh gradients (`.mesh-card`)
- Path alias: `@/*` → `./src/*`

## Environment Variables

Required: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SEATS_AERO_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`.

Notifications: `RESEND_API_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.

Cron: `CRON_SECRET` (optional but recommended for Vercel cron auth).
