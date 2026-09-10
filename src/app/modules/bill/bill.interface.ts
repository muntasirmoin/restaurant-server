import { Types } from "mongoose";

export interface IBill {
  order: Types.ObjectId;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "mobile" | "unpaid";
  generatedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
