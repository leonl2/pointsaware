# PointsAware - Rewards Optimization SaaS

## Context
You have significant Chase Ultimate Rewards and Amex Membership Rewards points but lack clarity on when and how to use them for maximum value on business/first class flights. This app solves that by aggregating award flight availability, optimizing transfer partner routing, and proactively alerting you to deals. Eventually, PointsAware will expand beyond flights to cover all rewards optimization.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui (base-ui) + "Midnight First Class" design system
- **Fonts:** Source Serif 4 (display), Outfit (body), JetBrains Mono (mono)
- **Auth:** Clerk v7 (hosted UI, MFA support, proxy-based route protection)
- **Database:** Neon Postgres + Drizzle ORM
- **Cache:** Upstash Redis
- **Background Jobs:** Inngest (durable functions on Vercel serverless)
- **Notifications:** Resend (email), Twilio (SMS), Web Push API
- **Billing:** Stripe (free/pro/premium tiers)
- **Data Source:** seats.aero API (award flight availability)
- **Deploy:** Vercel

## Design System: "Midnight First Class"
Dark navy base (`#0f1729`) with gold (`#d4a853`) and cyan (`#38bdf8`) accents. Boarding-pass styled flight cards with perforated edges. Grain texture overlay, gradient mesh backgrounds, glow effects. Credit-card shaped widgets for points balances. See `src/app/globals.css` for full token definitions.

## Data Source Decision
**seats.aero** is the primary data source. Cash-fare APIs (Amadeus, Google Flights) do not show points/miles pricing. A $5,000 business class ticket might be bookable for 60k points via the right transfer partner — only award-specific APIs surface this. seats.aero covers United, ANA, Aeroplan, Singapore KrisFlyer, British Airways Avios, and more. Budget ~$100-500/mo for API access.

## Key Feature: Transfer Optimizer
The core differentiator. When a user searches SFO→Tokyo in business:
1. Query `flight_deals` for all award availability on the route
2. Cross-reference `transfer_partners` to find which points currencies (Chase UR, Amex MR) can book each option
3. Calculate effective cost from each source, accounting for transfer ratios
4. Rank by total points cost and present the optimal path (e.g., "Transfer 60k Chase UR → United MileagePlus")

## Points Balance Sync
Plaid does NOT support reward points balances. Approach:
- **MVP:** Manual entry with credit-card-shaped UI widgets
- **V2:** Periodic reminders to update balances
- **V3:** AwardWallet API integration (they solve this via screen scraping)

## Database Schema (Drizzle ORM)
Key tables: `users`, `points_balances` (program + balance per user), `saved_searches`, `alerts` (threshold + channels), `flight_deals` (cached award availability from seats.aero), `price_history` (trend tracking per route), `notifications` (in-app), `transfer_partners` (reference data: source program → airline program with ratios).

Schema defined in `src/lib/db/schema.ts`.

## Project Structure
```
pointsjet/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login/signup (Clerk)
│   │   ├── (dashboard)/      # Protected: dashboard, search, alerts, points, deals, settings
│   │   ├── (marketing)/      # Landing page, pricing
│   │   └── api/              # flights/, alerts/, points/, notifications/, cron/, webhooks/
│   ├── lib/
│   │   ├── db/               # schema.ts, migrations/, queries/ (users, points, searches, alerts, notifications, price-history)
│   │   ├── services/         # seats-aero.ts, transfer-optimizer.ts, alert-monitor.ts, notifications.ts, email.ts
│   │   ├── constants/        # airlines.ts, transfer-partners.ts
│   │   ├── cache/            # Upstash Redis client
│   │   └── types/            # flight.ts, api.ts
│   ├── components/
│   │   ├── flights/          # search-form, flight-card, availability-calendar
│   │   ├── alerts/           # alert-form, alert-list
│   │   ├── dashboard/        # deals-feed
│   │   ├── layout/           # sidebar, header (with live notification bell)
│   │   └── ui/               # shadcn components
│   └── hooks/
├── public/airlines/          # Airline logo SVGs
├── public/cards/             # Credit card graphics
└── vercel.json               # Cron config
```

## Background Job Architecture (Vercel Cron)
Currently using Vercel cron (defined in `vercel.json`), not Inngest. Inngest is installed but unused — may add later if fan-out or retries become needed.
- **Daily 9am UTC:** `/api/cron/check-prices` — Fetch latest award prices for all active alerts, record to `price_history`
- **Daily 10am UTC:** `/api/cron/send-alerts` — Evaluate active alerts against latest deals, dispatch notifications (email/in-app)
- **Daily 3am UTC:** `/api/cron/cleanup` — Purge old price_history (>90 days), expired flight_deals (>24h), read notifications (>30 days)

## Subscription Tiers
| Feature | Free | Pro ($9/mo) | Premium ($19/mo) |
|---------|------|-------------|-------------------|
| Searches/day | 10 | Unlimited | Unlimited |
| Active alerts | 3 | 25 | Unlimited |
| Channels | Email only | Email + Push | All (incl. SMS) |
| Price history | 7 days | 90 days | 1 year |
| Programs | 1 | 2 | Unlimited |

## Build Phases

### Phase 1: Foundation -- COMPLETE
- [x] Next.js + Tailwind + shadcn/ui project init
- [x] Clerk auth setup (v7 with proxy.ts)
- [x] Neon Postgres + Drizzle schema
- [x] Transfer partners seed data (Chase UR + Amex MR)
- [x] seats.aero API client
- [x] Flight search page + boarding-pass flight cards
- [x] "Midnight First Class" design system applied to all pages
- [x] Marketing landing page + pricing page
- [x] Dashboard, alerts, deals, settings, notifications pages (UI)
- [x] Points balance page with credit-card widgets + inline editing

### Phase 2: Core Product -- COMPLETE
- [x] Transfer optimizer integration into search results UI
- [x] Points balance persistence (DB read/write via /api/points)
- [x] Saved searches (CRUD via /api/searches, dashboard integration)
- [x] Redis caching for search results (was already in place from Phase 1)
- [x] Availability calendar heatmap (date-based pricing grid with color coding)
- [ ] Route map (Mapbox) — deferred to Phase 5

### Phase 3: Alerts & Notifications — IN PROGRESS
- [x] DB query layer: alerts, notifications, price-history CRUD
- [x] Alert monitor service with 6-hour throttle
- [x] Notification dispatcher (email via Resend, in-app, push/SMS channel stubs)
- [x] Cron route handlers: check-prices, send-alerts, cleanup (Vercel cron, no Inngest)
- [x] API routes: /api/alerts CRUD, /api/notifications CRUD, /api/notifications/unread-count
- [x] Alert creation UI wired to DB (form + list with toggle/delete)
- [x] Notifications page wired to real data (read/unread, mark all read, delete)
- [x] Header bell with live unread count (polls every 30s)
- [x] Dashboard shows real active alert count
- [x] Points balance upsert fixed (atomic onConflictDoUpdate)
- [x] seats.aero parseMileageCost Infinity bug fixed
- [x] seats.aero pagination implemented (cursor-based, max 10 pages)
- [ ] Price history chart component (recharts) — deferred to Phase 4
- [ ] Web push registration + service worker — deferred to Phase 4
- [ ] Inngest — deferred; using Vercel cron-only for now

### Phase 4: Intelligence & Polish — IN PROGRESS
- [x] Tier limits utility + rate limiting (Redis sliding window)
- [x] Tier enforcement in API routes (search rate limit, alert count, program count, channel validation)
- [x] Stripe billing: checkout, portal, webhook, pricing page integration
- [x] Web push notifications: service worker, VAPID, subscribe/unsubscribe, push prompt component
- [x] SMS notifications via Twilio (premium tier only)
- [x] Notification dispatcher wired to real push + SMS (replaced stubs)
- [x] Price history chart component (recharts AreaChart with trend insight)
- [x] "Best time to book" insight from price history trends
- [x] Price history API endpoint with tier-based day limits
- [x] Daily digest email cron (morning email with top deals per saved search)
- [x] Deals API + deals feed wired to real data (replaced hardcoded samples)
- [x] Settings page fully functional (home airport, notification prefs, phone, subscription tier, Stripe portal)
- [x] Mobile marketing nav (Sheet-based hamburger menu)
- [x] Error boundary for dashboard routes
- [x] Toast notifications (sonner) for user actions (alerts, searches, settings)
- [x] User preferences API (GET/PUT /api/user/preferences)

### Phase 5: Growth
- [ ] Personalized "deals from your airport" feed
- [ ] Fare class comparison across programs
- [ ] AwardWallet API for balance sync
- [ ] SEO route pages
- [ ] Analytics (PostHog)
- [ ] Expand beyond flights (hotels, etc.)

## Important Notes
- Next.js 16 uses `proxy.ts` instead of `middleware.ts`
- shadcn v4 uses base-ui (NOT Radix) — `asChild` prop does not exist
- Clerk v7 API differs from older versions — `afterSignOutUrl` removed from UserButton
- The `pj-` CSS prefix is an internal convention kept from the original "PointsJet" name
- The project directory is still named `pointsjet/` on disk

## Verification Plan
1. **Search:** Enter a route (e.g., SFO→NRT, business class) → verify results show award availability with points prices and transfer paths
2. **Transfer optimizer:** With Chase UR balance entered, verify the app recommends the cheapest transfer partner
3. **Alerts:** Create a price-drop alert → trigger the cron manually → verify email/push/in-app notification arrives
4. **Auth:** Sign up, sign in, verify protected routes redirect unauthenticated users
5. **Billing:** Subscribe to Pro tier → verify feature gates unlock
6. **Background jobs:** Check Inngest dashboard for successful cron runs and event processing
