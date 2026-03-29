import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  jsonb,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── USERS ───────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").unique().notNull(),
  name: text("name"),
  image: text("image"),
  phone: text("phone"),
  subscriptionTier: text("subscription_tier").default("free").notNull(), // 'free' | 'pro' | 'premium'
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  pushSubscription: jsonb("push_subscription"),
  notificationPrefs: jsonb("notification_prefs").$type<{
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    dailyDigest: boolean;
  }>().default({ email: true, sms: false, push: true, inApp: true, dailyDigest: false }),
  homeAirport: text("home_airport"), // IATA code
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── POINTS BALANCES ─────────────────────────────────
export const pointsBalances = pgTable(
  "points_balances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    program: text("program").notNull(), // 'chase_ur' | 'amex_mr'
    balance: integer("balance").notNull().default(0),
    lastSyncedAt: timestamp("last_synced_at"),
    syncMethod: text("sync_method").default("manual"), // 'manual' | 'awardwallet'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("points_balances_user_program_idx").on(table.userId, table.program),
  ]
);

// ─── SAVED SEARCHES ──────────────────────────────────
export const savedSearches = pgTable("saved_searches", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  origin: text("origin").notNull(), // IATA code
  destination: text("destination"), // nullable for "anywhere"
  departureStart: date("departure_start").notNull(),
  departureEnd: date("departure_end").notNull(),
  returnStart: date("return_start"),
  returnEnd: date("return_end"),
  cabinClasses: text("cabin_classes").array().notNull(), // ['business', 'first']
  passengers: integer("passengers").default(1).notNull(),
  maxPoints: integer("max_points"),
  preferredPrograms: text("preferred_programs").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── ALERTS ──────────────────────────────────────────
export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  searchId: uuid("search_id")
    .references(() => savedSearches.id, { onDelete: "cascade" })
    .notNull(),
  alertType: text("alert_type").notNull(), // 'price_drop' | 'availability' | 'best_time'
  thresholdPoints: integer("threshold_points"),
  channels: text("channels").array().notNull(), // ['email','sms','push','in_app']
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── FLIGHT DEALS ────────────────────────────────────
export const flightDeals = pgTable(
  "flight_deals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull(), // 'seats_aero'
    sourceId: text("source_id"),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    airline: text("airline").notNull(), // marketing carrier IATA
    operatingAirline: text("operating_airline"),
    flightNumber: text("flight_number"),
    cabinClass: text("cabin_class").notNull(), // 'business' | 'first'
    rawCabinClass: text("raw_cabin_class"), // program-specific name
    departureAt: timestamp("departure_at").notNull(),
    arrivalAt: timestamp("arrival_at").notNull(),
    pointsPrice: integer("points_price").notNull(),
    cashCopay: numeric("cash_copay", { precision: 10, scale: 2 }),
    program: text("program").notNull(), // loyalty program (e.g., 'united_mileageplus')
    sourcePrograms: text("source_programs").array(), // UR/MR programs that transfer here
    seatsRemaining: integer("seats_remaining"),
    equipment: text("equipment"),
    isDirect: boolean("is_direct").default(false),
    duration: integer("duration"), // minutes
    fetchedAt: timestamp("fetched_at").notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("flight_deals_route_idx").on(
      table.origin,
      table.destination,
      table.departureAt,
      table.cabinClass
    ),
    index("flight_deals_program_idx").on(table.program),
    index("flight_deals_fetched_idx").on(table.fetchedAt),
  ]
);

// ─── PRICE HISTORY ───────────────────────────────────
export const priceHistory = pgTable(
  "price_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routeKey: text("route_key").notNull(), // 'SFO-NRT-business-united_mileageplus'
    pointsPrice: integer("points_price").notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("price_history_route_idx").on(table.routeKey, table.recordedAt),
  ]
);

// ─── NOTIFICATIONS ───────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    alertId: uuid("alert_id").references(() => alerts.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(
      table.userId,
      table.isRead,
      table.createdAt
    ),
  ]
);

// ─── TRANSFER PARTNERS ──────────────────────────────
export const transferPartners = pgTable(
  "transfer_partners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceProgram: text("source_program").notNull(), // 'chase_ur' | 'amex_mr'
    airlineProgram: text("airline_program").notNull(), // 'united_mileageplus'
    airlineName: text("airline_name").notNull(),
    airlineCode: text("airline_code").notNull(), // IATA code
    transferRatio: numeric("transfer_ratio", { precision: 3, scale: 2 })
      .notNull()
      .default("1.00"), // 1:1 = 1.00
    transferTime: text("transfer_time"), // 'instant' | '1-2 days'
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    uniqueIndex("transfer_partners_unique_idx").on(
      table.sourceProgram,
      table.airlineProgram
    ),
  ]
);

// ─── RELATIONS ───────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  pointsBalances: many(pointsBalances),
  savedSearches: many(savedSearches),
  alerts: many(alerts),
  notifications: many(notifications),
}));

export const pointsBalancesRelations = relations(pointsBalances, ({ one }) => ({
  user: one(users, { fields: [pointsBalances.userId], references: [users.id] }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one, many }) => ({
  user: one(users, { fields: [savedSearches.userId], references: [users.id] }),
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, { fields: [alerts.userId], references: [users.id] }),
  search: one(savedSearches, { fields: [alerts.searchId], references: [savedSearches.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  alert: one(alerts, { fields: [notifications.alertId], references: [alerts.id] }),
}));
