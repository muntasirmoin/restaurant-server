import { Schema, model } from "mongoose";
import { IBill } from "./bill.interface";
const billSchema = new Schema<IBill>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 0.05 },
    taxAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile", "unpaid"],
      default: "unpaid",
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false },
);
const Bill = model<IBill>("Bill", billSchema);
export default Bill;
