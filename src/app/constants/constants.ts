export const USER_ROLES = [
  "administrator",
  "manager",
  "counter",
  "waiter",
  "kitchen",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "billed",
  "cancelled",
] as const;

export const ALLOWED_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
  served: ["billed"],
  billed: [],
  cancelled: [],
};
