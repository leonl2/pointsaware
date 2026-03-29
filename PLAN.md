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
│   │   ├── db/               # schema.ts, migrations/, queries/
│   │   ├── services/         # seats-aero.ts, transfer-optimizer.ts
│   │   ├── constants/        # airlines.ts, transfer-partners.ts
│   │   ├── cache/            # Upstash Redis client
│   │   ├── queue/            # Inngest client + functions
│   │   └── types/            # flight.ts
│   ├── components/
│   │   ├── flights/          # search-form, flight-card
│   │   ├── points/           # balance-card, transfer-optimizer
│   │   ├── alerts/           # alert-form, alert-list
│   │   ├── dashboard/        # deals-feed, price-chart, stats-overview
│   │   ├── layout/           # sidebar, header
│   │   └── ui/               # shadcn components
│   └── hooks/
├── public/airlines/          # Airline logo SVGs
├── public/cards/             # Credit card graphics
└── vercel.json               # Cron config
```

## Background Job Architecture (Inngest)
- **Every 15 min:** Fetch award availability from seats.aero for active searches → upsert `flight_deals` + `price_history`
- **On deals.updated event:** Check alerts against new data → fan-out notifications (email/SMS/push/in-app)
- **Daily 9am:** Digest email with top deals per user
- **Daily 3am:** Cleanup expired `flight_deals` rows

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

### Phase 2: Core Product (In Progress)
- [ ] Transfer optimizer integration into search results UI
- [ ] Points balance persistence (DB read/write)
- [ ] Saved searches
- [ ] Redis caching for search results
- [ ] Route map (Mapbox) + availability calendar heatmap

### Phase 3: Alerts & Notifications
- [ ] Inngest setup + price check cron
- [ ] Alert creation UI wired to DB
- [ ] Email notifications (Resend)
- [ ] In-app notifications + web push
- [ ] Price history tracking + chart component

### Phase 4: Intelligence & Polish
- [ ] "Best time to book" from price history trends
- [ ] Daily digest emails
- [ ] Stripe billing (tier gating)
- [ ] SMS alerts (Twilio, premium tier)
- [ ] Mobile responsive pass, loading/empty states, error handling
- [ ] Rate limiting via Redis

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
