import { Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "billed"
  | "cancelled";

export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}
export interface IOrder {
  orderType: "dine-in" | "walk-in";
  table?: Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  createdBy: Types.ObjectId;
  confirmedBy?: Types.ObjectId;
  total: number;
}
