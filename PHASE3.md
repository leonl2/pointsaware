# Phase 3: Alerts & Notifications — Implementation Plan

## Overview

Phase 3 wires up the alert and notification system so users get notified when award prices drop on routes they care about. It connects the existing DB schema (alerts, notifications, priceHistory tables) to real services (Resend email, web push, in-app) and implements the cron jobs already configured in `vercel.json`.

## Current State

### Already Done
- **DB schema** — `alerts`, `notifications`, `priceHistory` tables fully defined in `src/lib/db/schema.ts`
- **User prefs** — `notificationPrefs` (JSONB) and `pushSubscription` (JSONB) columns on `users` table
- **UI shells** — Alerts page (`/alerts`) and Notifications page (`/notifications`) have layouts and empty states
- **Cron config** — `vercel.json` defines 3 cron schedules (check-prices 9am, send-alerts 10am, cleanup 3am UTC)
- **Packages installed** — `resend`, `inngest`, `@upstash/qstash`, `sonner` (toasts), `date-fns`
- **Sidebar nav** — Alerts link already in dashboard sidebar

### Needs to Be Built
- DB query layer for alerts, notifications, price history
- API routes: `/api/alerts` CRUD, `/api/notifications` CRUD
- Cron route handlers: `check-prices`, `send-alerts`, `cleanup`
- Notification services: email (Resend), web push, in-app
- Alert monitoring service: price comparison + trigger logic
- Price history service: recording + trend detection
- UI: alert creation form, alert list, notification list, header bell icon
- Inngest client + event functions (or Vercel cron-only approach)

---

## Implementation Steps

### Step 1: DB Query Layer

Create query helpers following the existing pattern in `src/lib/db/queries/`.

**Files to create:**
- `src/lib/db/queries/alerts.ts` — CRUD for alerts table
  - `getUserAlerts(userId)` — list all alerts for a user
  - `getActiveAlerts()` — all active alerts across users (for cron)
  - `createAlert(data)` — insert new alert
  - `updateAlert(id, data)` — toggle active, update threshold/channels
  - `deleteAlert(id)` — remove alert
  - `markAlertTriggered(id)` — update `lastTriggered` timestamp
- `src/lib/db/queries/notifications.ts` — CRUD for notifications table
  - `getUserNotifications(userId, { limit, offset })` — paginated list
  - `getUnreadCount(userId)` — count for badge
  - `createNotification(data)` — insert notification
  - `markAsRead(id)` / `markAllAsRead(userId)` — update `isRead`
  - `deleteNotification(id)`
- `src/lib/db/queries/price-history.ts` — price history operations
  - `recordPrice(routeKey, pointsPrice)` — insert row
  - `getRouteHistory(routeKey, days)` — time-series for charts
  - `detectPriceDrop(routeKey, thresholdPercent)` — compare latest vs recent avg
  - `cleanupOldRecords(olderThanDays)` — delete expired rows

### Step 2: API Routes

**Files to create:**
- `src/app/api/alerts/route.ts`
  - `GET` — list current user's alerts (auth required)
  - `POST` — create alert (body: searchId, alertType, thresholdPoints, channels)
  - `DELETE` — delete alert by id (query param)
- `src/app/api/alerts/[id]/route.ts`
  - `PUT` — update alert (toggle active, change threshold)
- `src/app/api/notifications/route.ts`
  - `GET` — list notifications (paginated, auth required)
  - `PUT` — mark as read (body: { id } or { all: true })
  - `DELETE` — delete notification by id
- `src/app/api/notifications/unread-count/route.ts`
  - `GET` — return `{ count: number }` for header badge

### Step 3: Notification Services

**Files to create:**
- `src/lib/services/notifications.ts` — unified notification dispatcher
  ```
  sendNotification(userId, alert, flightDeal) → routes to channels:
    - email → Resend
    - inApp → insert into notifications table
    - push → Web Push API
  ```
- `src/lib/services/email.ts` — Resend email sender
  - `sendAlertEmail(to, alert, deal)` — price drop alert email
  - `sendDigestEmail(to, deals[])` — daily digest (Phase 4, but scaffold now)
  - Uses Resend SDK, env var `RESEND_API_KEY`
- `src/lib/services/web-push.ts` — Web Push notifications
  - `sendPushNotification(subscription, payload)` — send via VAPID
  - Uses `web-push` package (needs install)
  - Env vars: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (already in .env.local template)

### Step 4: Alert Monitoring Service

**File to create:**
- `src/lib/services/alert-monitor.ts`
  - `checkAlertsForRoute(routeKey, currentDeals[])` — compare deals against active alerts on that route
  - `evaluateAlert(alert, deals[])` — check if threshold met
    - `price_drop`: current points < alert.thresholdPoints
    - `availability`: new availability found on route
  - `processAlertTrigger(alert, matchingDeals[])` — fan out notifications via channels
  - Throttle: skip if `lastTriggered` < 6 hours ago (avoid spam)

### Step 5: Cron Route Handlers

**Files to create:**
- `src/app/api/cron/check-prices/route.ts` (runs daily 9am UTC)
  1. Fetch all active alerts with their linked savedSearches
  2. Group by unique route (origin/dest/cabin)
  3. For each route: call seats.aero API for latest availability
  4. Upsert results into `flightDeals` table
  5. Record prices in `priceHistory` table
  6. Emit `deals.updated` event (or directly call alert monitor)
- `src/app/api/cron/send-alerts/route.ts` (runs daily 10am UTC)
  1. Fetch all active alerts
  2. For each: run `evaluateAlert()` against latest deals
  3. For triggered alerts: dispatch notifications via all enabled channels
  4. Update `lastTriggered` timestamp
- `src/app/api/cron/cleanup/route.ts` (runs daily 3am UTC)
  1. Delete `priceHistory` rows older than retention period (7d free, 90d pro, 365d premium)
  2. Delete expired/stale `flightDeals` rows (older than 24h)
  3. Delete read notifications older than 30 days

**Auth:** Verify `Authorization: Bearer <CRON_SECRET>` header from Vercel cron, or use Vercel's built-in cron auth.

### Step 6: Inngest Setup (Optional — Evaluate vs. Vercel Cron-Only)

The cron jobs in `vercel.json` already handle scheduling. Inngest adds value for:
- Fan-out: sending notifications to many users in parallel
- Retries: auto-retry failed email/push sends
- Observability: Inngest dashboard shows job history

**Decision:** Start with Vercel cron-only for simplicity. If fan-out or retries become needed, add Inngest as an intermediate layer.

If proceeding with Inngest:
- `src/lib/queue/inngest.ts` — Inngest client init
- `src/lib/queue/functions/` — event handler functions
- `src/app/api/inngest/route.ts` — Inngest serve endpoint

### Step 7: UI — Alert Creation & Management

**Files to create:**
- `src/components/alerts/alert-form.tsx` — Create/edit alert dialog
  - Select from saved searches (or enter route manually)
  - Alert type: price drop / availability
  - Threshold: points amount (for price drop)
  - Channels: checkboxes for email, push, in-app
  - Premium badge on SMS channel
- `src/components/alerts/alert-list.tsx` — List of user's alerts
  - Each row: route, type, threshold, channels, active toggle, delete
  - Empty state already exists in page
- `src/components/alerts/alert-card.tsx` — Individual alert display card
  - Route (SFO → NRT), cabin class, threshold
  - Last triggered timestamp
  - Active/paused toggle
  - Edit and delete actions

**Files to update:**
- `src/app/(dashboard)/alerts/page.tsx` — Wire up to real data via `/api/alerts`

### Step 8: UI — Notification List & Header Bell

**Files to create:**
- `src/components/notifications/notification-list.tsx` — Full notification list
  - Each item: icon (by type), title, body, timestamp, read/unread styling
  - Click → navigate to `link` URL
  - Mark as read on click
- `src/components/notifications/notification-bell.tsx` — Header notification icon
  - Bell icon with unread count badge
  - Dropdown preview showing latest 5 notifications
  - "View all" link to `/notifications`
  - Polls `/api/notifications/unread-count` every 30s (or use SSE later)

**Files to update:**
- `src/app/(dashboard)/notifications/page.tsx` — Wire up to real data
- `src/components/layout/header.tsx` — Add notification bell
- `src/app/(dashboard)/dashboard/page.tsx` — Show real active alert count

### Step 9: Price History Chart

**Files to create:**
- `src/components/dashboard/price-chart.tsx` — Line chart showing price over time
  - X-axis: dates, Y-axis: points price
  - Highlight drops below alert threshold
  - Use lightweight chart library (recharts is common, but check if already in deps)
  - Show on flight detail or alert detail view

**Package to install:**
- `recharts` (or `lightweight-charts`) for the chart component

### Step 10: Web Push Registration

**Files to create:**
- `src/lib/services/push-registration.ts` — Client-side push subscription
  - Register service worker
  - Request notification permission
  - Subscribe to push and send subscription to backend
- `public/sw.js` — Service worker for push notifications
  - Listen for `push` events
  - Display browser notification with title, body, icon
  - Handle notification click → open link

**Files to update:**
- `src/app/(dashboard)/settings/page.tsx` — Add push notification toggle that triggers browser permission

---

## Package Installs Needed

```bash
npm install web-push recharts
```

- `web-push` — VAPID-based web push notifications (server-side)
- `recharts` — Lightweight React charting for price history

All other packages (resend, inngest, date-fns, sonner) are already installed.

---

## Environment Variables

Already in `.env.local` template:
- `RESEND_API_KEY` — Resend email service
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — Web push
- `CRON_SECRET` — Vercel cron auth (optional but recommended)

---

## Build Order & Dependencies

```
Step 1: DB Queries ──────────────────┐
                                     ├──→ Step 2: API Routes ──→ Step 7: Alert UI
                                     │                       ──→ Step 8: Notification UI
Step 3: Notification Services ───────┤
                                     ├──→ Step 5: Cron Handlers
Step 4: Alert Monitor ──────────────┘
                                          Step 9: Price Chart (independent)
                                          Step 10: Web Push Registration (after Step 3)
```

Steps 1, 3, 4 can be built in parallel. Steps 7-10 can be built in parallel once API routes exist.

---

## Verification

1. **Alert CRUD:** Create alert on a saved search → see it in alert list → toggle off → delete
2. **Price check cron:** Trigger `/api/cron/check-prices` manually → verify `priceHistory` rows inserted
3. **Alert trigger:** Set a low threshold → trigger `/api/cron/send-alerts` → verify email arrives (Resend) + in-app notification appears
4. **Notification UI:** See notifications in header bell → click to mark read → view all on `/notifications`
5. **Price chart:** View price history chart for a tracked route → verify data points match `priceHistory` table
6. **Web push:** Enable push in settings → trigger alert → verify browser notification appears
7. **Cleanup cron:** Trigger `/api/cron/cleanup` → verify old records removed
