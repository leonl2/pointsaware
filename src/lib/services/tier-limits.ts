export type SubscriptionTier = "free" | "pro" | "premium";

export interface TierConfig {
  searchesPerDay: number; // -1 = unlimited
  maxAlerts: number; // -1 = unlimited
  channels: string[];
  historyDays: number;
  maxPrograms: number; // -1 = unlimited
}

export const TIER_LIMITS: Record<SubscriptionTier, TierConfig> = {
  free: {
    searchesPerDay: 10,
    maxAlerts: 3,
    channels: ["email", "in_app"],
    historyDays: 7,
    maxPrograms: 1,
  },
  pro: {
    searchesPerDay: -1,
    maxAlerts: 25,
    channels: ["email", "push", "in_app"],
    historyDays: 90,
    maxPrograms: 2,
  },
  premium: {
    searchesPerDay: -1,
    maxAlerts: -1,
    channels: ["email", "push", "sms", "in_app"],
    historyDays: 365,
    maxPrograms: -1,
  },
};

export function getTierLimits(tier: string): TierConfig {
  return TIER_LIMITS[(tier as SubscriptionTier)] ?? TIER_LIMITS.free;
}

export function canUseChannel(tier: string, channel: string): boolean {
  return getTierLimits(tier).channels.includes(channel);
}

export function getHistoryDays(tier: string): number {
  return getTierLimits(tier).historyDays;
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}
