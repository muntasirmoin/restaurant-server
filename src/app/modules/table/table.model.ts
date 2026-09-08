import { Schema, model } from "mongoose";

import { ITable } from "./table.interface";

const tableSchema = new Schema<ITable>(
  {
    number: { type: Number, required: true, unique: true },
    status: { type: String, enum: ["free", "occupied"], default: "free" },
  },
  { timestamps: true, versionKey: false },
);
const Table = model<ITable>("Table", tableSchema);

export default Table;
