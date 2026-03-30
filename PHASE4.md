# Phase 4: Intelligence & Polish — Implementation Plan

## Overview

Phase 4 adds monetization (Stripe billing), intelligence features (price history charts, "best time to book" insights, daily digest emails), full notification coverage (web push, SMS via Twilio), subscription tier enforcement across all API routes, and UX polish (mobile nav, error boundaries, toast notifications, settings page wiring).

## Current State

### Already Done (Phases 1–3)
- **DB schema** — All 8 tables defined, including `users.subscriptionTier`, `users.stripeCustomerId`, `users.stripeSubscriptionId`, `users.pushSubscription`, `users.notificationPrefs`, `users.phone`, `users.homeAirport`
- **Price history queries** — `recordPrice()`, `getRouteHistory()`, `detectPriceDrop()`, `cleanupOldRecords()`, `buildRouteKey()` in `src/lib/db/queries/price-history.ts`
- **Notification dispatcher** — `src/lib/services/notifications.ts` routes to email (Resend) and in-app, with `push` and `sms` channel stubs
- **Cron jobs** — `check-prices`, `send-alerts`, `cleanup` all implemented and scheduled in `vercel.json`
- **Recharts** — v3.8.1 installed, no chart components built yet
- **Sonner** — Toast library installed and `<Toaster>` rendered in root layout, but `toast()` never called anywhere
- **Redis** — Upstash client set up in `src/lib/cache/index.ts` with `getCached`, `setCache`, `invalidateCache`
- **Pricing page** — Three tiers defined (Free $0, Pro $9/mo, Premium $19/mo) with feature lists
- **Settings page** — UI shell with home airport select, notification toggles, subscription section — all non-functional
- **Deals feed** — Hardcoded `SAMPLE_DEALS` in `src/components/dashboard/deals-feed.tsx`

### Not Yet Done
- **Zero tier enforcement** — No API route checks `subscriptionTier`. All users get unlimited access
- **No Stripe** — Package not installed, no checkout/webhook/portal routes
- **No rate limiting** — Redis exists but no rate limit logic
- **No web push** — No `web-push` package, no service worker, no VAPID keys
- **No SMS** — No `twilio` package, no SMS sending logic
- **No price charts** — Recharts installed but unused
- **No daily digest** — No cron route or email template
- **No error boundaries** — No `error.tsx` files
- **Marketing mobile nav missing** — `hidden md:flex` with no fallback
- **Deals page non-functional** — Hardcoded sample data
- **Settings page non-functional** — No persistence

---

## Package Installs

```bash
npm install stripe web-push twilio @types/web-push
```

## New Environment Variables

| Variable | Service | Required For |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | Stripe | Checkout, webhook, portal |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signature verification |
| `STRIPE_PRO_PRICE_ID` | Stripe | Pro tier checkout |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe | Premium tier checkout |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push | Client-side push subscription |
| `VAPID_PRIVATE_KEY` | Web Push | Server-side push sending |
| `TWILIO_ACCOUNT_SID` | Twilio | SMS sending |
| `TWILIO_AUTH_TOKEN` | Twilio | SMS sending |
| `TWILIO_PHONE_NUMBER` | Twilio | SMS sender number |

---

## Implementation Steps

### Step 1: Tier Limits + Rate Limiting

Foundation layer — everything else depends on this.

**Files to create:**
- `src/lib/services/tier-limits.ts` — Pure config + helper functions
  - `TIER_LIMITS` constant:
    - Free: 10 searches/day, 3 alerts, email+in_app only, 7d history, 1 program
    - Pro: unlimited searches, 25 alerts, email+push+in_app, 90d history, 2 programs
    - Premium: unlimited searches+alerts, all channels (incl SMS), 365d history, unlimited programs
  - `getTierLimits(tier)` — returns limits config for a tier
  - `canUseChannel(tier, channel)` — boolean check
  - `getHistoryDays(tier)` — days of price history allowed
- `src/lib/services/rate-limiter.ts` — Redis-based sliding window counter
  - `checkRateLimit(userId, action, limit, windowSeconds)` → `{ allowed, remaining, resetAt }`
  - Uses Redis `INCR` + `EXPIRE` on key `ratelimit:{userId}:{action}:{window}`
  - `limit = -1` means unlimited (skip check entirely)
- `src/lib/services/__tests__/tier-limits.test.ts` — Pure unit tests
- `src/lib/services/__tests__/rate-limiter.test.ts` — Mock Redis

### Step 2: Tier Enforcement in API Routes

**Files to modify:**
- `src/app/api/flights/search/route.ts`
  - After `getOrCreateDbUser()`, get tier, call `checkRateLimit(user.id, 'search', limits.searchesPerDay, 86400)`
  - Return 429 with `{ error: "Daily search limit reached" }` if not allowed
  - Add `X-RateLimit-Remaining` header
- `src/app/api/alerts/route.ts`
  - In POST: check `getActiveAlertCount(user.id)` against `maxAlerts`
  - Validate channels against `canUseChannel(tier, channel)` — reject `sms` for non-premium, `push` for free
  - Return 403 if at limit
- `src/app/api/points/route.ts`
  - In PUT: count existing programs, reject if at `maxPrograms` limit

### Step 3: Stripe Billing

**Files to create:**
- `src/lib/services/stripe.ts` — Lazy-init Stripe client (same pattern as DB/Resend)
  - `createCheckoutSession(userId, email, priceId)` → `{ url }`
  - `createCustomerPortalSession(stripeCustomerId)` → `{ url }`
  - `handleSubscriptionEvent(event)` — processes `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `src/app/api/stripe/checkout/route.ts` — POST, Clerk-protected
  - Accepts `{ priceId }`, creates Stripe checkout session, returns `{ url }`
- `src/app/api/stripe/portal/route.ts` — POST, Clerk-protected
  - Creates customer portal session for managing subscription
- `src/app/api/webhooks/stripe/route.ts` — POST, NO Clerk auth
  - Verifies webhook signature via `request.text()` (NOT `request.json()`)
  - Maps price IDs to tiers, updates `users` table
- `src/components/billing/checkout-button.tsx` — "use client" component
  - On click: POST to `/api/stripe/checkout`, redirect to Stripe

**Files to modify:**
- `src/lib/db/queries/users.ts` — add `updateUserSubscription()`, `updateUserPreferences()`
- `src/app/(marketing)/pricing/page.tsx` — embed CheckoutButton for Pro/Premium CTAs

### Step 4: Web Push + SMS

**Files to create:**
- `src/lib/services/web-push.ts` — Lazy-init VAPID setup
  - `sendPushNotification(subscription, { title, body, url })`
- `public/sw.js` — Plain JS service worker (no imports)
  - `push` event → `self.registration.showNotification()`
  - `notificationclick` event → open URL, focus tab
- `src/app/api/push/subscribe/route.ts` — POST, saves subscription to user JSONB
- `src/app/api/push/unsubscribe/route.ts` — POST, clears subscription
- `src/components/notifications/push-prompt.tsx` — Registers SW, requests permission, POSTs subscription
- `src/lib/services/sms.ts` — Lazy-init Twilio client
  - `sendSms(to, body)`

**Files to modify:**
- `src/lib/services/notifications.ts` — Replace `push` and `sms` stubs with real implementations
  - Push: load user's `pushSubscription`, call `sendPushNotification()`
  - SMS: load user's `phone` + verify `premium` tier, call `sendSms()`

### Step 5: Price History Charts + Best Time to Book

**Files to create:**
- `src/app/api/flights/price-history/route.ts` — GET endpoint
  - Accepts `routeKey` and optional `days` params
  - Applies tier-based history limit via `getHistoryDays(tier)`
  - Computes trend insight: compare avg of last 7 days vs previous 7 days → `falling`/`rising`/`stable`
  - Returns `{ history: [...], insight: { trend, recommendation, avgPrice, lowestPrice } }`
- `src/components/dashboard/price-chart.tsx` — "use client" recharts component
  - `<AreaChart>` with pj-gold gradient fill, dark theme
  - Tooltip with date + price
  - "Best Time to Book" badge below chart
  - Fetches from `/api/flights/price-history`

**Files to modify:**
- `src/app/(dashboard)/search/page.tsx` — Show PriceChart below results for specific routes

### Step 6: Daily Digest + Deals Page

**Files to create:**
- `src/app/api/cron/daily-digest/route.ts` — GET with CRON_SECRET auth
  - Query users with `notificationPrefs.dailyDigest = true`
  - For each: get saved searches → best deals → send digest email
- `src/lib/db/queries/deals.ts`
  - `getRecentDeals(limit)` — recent flight deals from `flightDeals` table
  - `getDealsForRoutes(origins, destinations, limit)` — deals matching saved search routes
- `src/app/api/deals/route.ts` — GET, returns deals matching user's saved searches

**Files to modify:**
- `src/lib/services/email.ts` — add `sendDigestEmail(to, deals[])` with branded HTML template
- `vercel.json` — add `{ "path": "/api/cron/daily-digest", "schedule": "0 14 * * *" }` (9 AM ET)
- `src/components/dashboard/deals-feed.tsx` — replace `SAMPLE_DEALS` with `useEffect` fetch from `/api/deals`

### Step 7: Settings + Mobile Nav + Error Handling + Toasts

**Files to create:**
- `src/app/api/user/preferences/route.ts` — GET/PUT for homeAirport, notificationPrefs, phone, subscriptionTier
- `src/components/layout/marketing-header.tsx` — "use client" with Sheet-based mobile hamburger menu
- `src/app/(dashboard)/error.tsx` — Error boundary with retry button + dashboard link

**Files to modify:**
- `src/app/(dashboard)/settings/page.tsx` — Full functional rewrite:
  - Load preferences from `/api/user/preferences`
  - Save home airport, notification toggles, phone number on change
  - Show real subscription tier
  - Stripe portal button for paid users, upgrade link for free
  - Push notification prompt for pro/premium
- `src/app/(marketing)/layout.tsx` — Swap inline header for MarketingHeader component
- Add `toast()` calls from sonner to:
  - `alerts/page.tsx` — create, delete, toggle alerts
  - `dashboard/page.tsx` — delete search
  - `settings/page.tsx` — save preferences
  - `points/page.tsx` — balance save
  - `search-form.tsx` — search errors

### Step 8: Final Integration

**Files to modify:**
- `src/proxy.ts` — Add protected routes: `/api/push(.*)`, `/api/user(.*)`, `/api/stripe/checkout(.*)`, `/api/stripe/portal(.*)`, `/api/deals(.*)`
- `CLAUDE.md` — Update with new services, API routes, env vars, gotchas
- `PLAN.md` — Mark Phase 4 items complete

**Verification:**
- `npm run build` — clean pass
- `npm run test` — all tests pass

---

## Build Order & Dependencies

```
Step 1: Tier Limits + Rate Limiter ─────────┐
                                             ├──→ Step 2: Enforce in API Routes
                                             ├──→ Step 3: Stripe Billing
                                             ├──→ Step 5: Price History (uses getHistoryDays)
Step 4: Web Push + SMS ─────────────────────┤
                                             ├──→ Step 7: Settings (uses push prompt, shows tier)
Step 6: Daily Digest + Deals ───────────────┘
                                                  Step 8: Final Integration (after all steps)
```

Steps 1, 4, and 6 can be built in parallel. Steps 3, 5, 7 depend on Step 1 for tier limits.

---

## New Files Summary (~27 files)

```
src/lib/services/tier-limits.ts
src/lib/services/rate-limiter.ts
src/lib/services/stripe.ts
src/lib/services/web-push.ts
src/lib/services/sms.ts
src/lib/services/__tests__/tier-limits.test.ts
src/lib/services/__tests__/rate-limiter.test.ts
src/lib/services/__tests__/stripe.test.ts
src/lib/services/__tests__/web-push.test.ts
src/lib/services/__tests__/sms.test.ts
src/lib/services/__tests__/notifications.test.ts
src/lib/db/queries/deals.ts
src/app/api/stripe/checkout/route.ts
src/app/api/stripe/portal/route.ts
src/app/api/webhooks/stripe/route.ts
src/app/api/push/subscribe/route.ts
src/app/api/push/unsubscribe/route.ts
src/app/api/flights/price-history/route.ts
src/app/api/deals/route.ts
src/app/api/user/preferences/route.ts
src/app/api/cron/daily-digest/route.ts
src/components/dashboard/price-chart.tsx
src/components/billing/checkout-button.tsx
src/components/notifications/push-prompt.tsx
src/components/layout/marketing-header.tsx
src/app/(dashboard)/error.tsx
public/sw.js
```

---

## Critical Gotchas

- **Lazy-init ALL external clients** (Stripe, web-push, Twilio) — build must pass without env vars set
- **Stripe webhook route** needs raw body: use `request.text()`, NOT `request.json()` — Next.js App Router parses body automatically with `.json()`
- **Service worker** `public/sw.js` must be plain JS with no ES module imports
- **base-ui Select `onValueChange`** passes `string | null` — always guard: `(v) => v && setter(v)`
- **Redis client** in `cache/index.ts` instantiates at module level — may need lazy-init wrapper if rate-limiter import causes build failure
- **Stripe webhook route** at `/api/webhooks/stripe` must NOT go through Clerk auth — it's already excluded since `proxy.ts` only lists specific API prefixes
- **`PushSubscription` type** from browser API differs from `web-push` npm package type — store the JSONB as web-push's format

---

## Verification Plan

1. **Build:** `npm run build` — clean pass, no TypeScript errors
2. **Tests:** `npm run test` — tier limits, rate limiter, stripe events, push, sms, notification routing
3. **Rate limiting:** Search 11 times on free tier → 11th should return 429
4. **Alert limits:** Create 4th alert on free tier → should return 403
5. **Stripe checkout:** Click "Start Free Trial" on pricing → redirects to Stripe test checkout
6. **Stripe portal:** On settings page, "Manage Subscription" → opens Stripe portal
7. **Web push:** Enable push in settings → browser permission prompt → test notification arrives
8. **SMS:** Premium user with phone → alert trigger sends SMS
9. **Price chart:** Search a route → price trend chart renders below results
10. **Daily digest:** Trigger `/api/cron/daily-digest` → digest email sent to users with dailyDigest enabled
11. **Deals page:** `/deals` shows real deals from API, not sample data
12. **Settings:** Save home airport, toggle digest, see real tier — all persist on reload
13. **Mobile nav:** Visit landing page on mobile viewport → hamburger menu works
14. **Error boundary:** Force an error → styled error page with retry button
15. **Toasts:** Create/delete alert → success toast appears
