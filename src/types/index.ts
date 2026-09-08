export type UserRole =
  | "administrator"
  | "manager"
  | "counter"
  | "waiter"
  | "kitchen";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "billed"
  | "cancelled";
export interface JwtPayload {
  id: string;
  role: UserRole;
  name: string;
}
