import { Schema, model } from "mongoose";
import { IMenuItem } from "./menu.interface";

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);
const MenuItem = model<IMenuItem>("MenuItem", menuItemSchema);
export default MenuItem;
