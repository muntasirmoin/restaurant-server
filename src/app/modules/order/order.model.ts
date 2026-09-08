import { Schema, model } from "mongoose";
import { IOrder, IOrderItem } from "./order.interface";
import "../table/table.model";

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String },
  },
  { _id: false },
);
const orderSchema = new Schema<IOrder>(
  {
    orderType: { type: String, enum: ["dine-in", "walk-in"], required: true },
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    items: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "billed",
        "cancelled",
      ],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
    total: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false },
);
// Mongoose 9: no next() parameter, same lesson as user.model.ts. This one's synchronous, so not even async.

orderSchema.pre("save", function () {
  this.total = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});
const Order = model<IOrder>("Order", orderSchema);
export default Order;
