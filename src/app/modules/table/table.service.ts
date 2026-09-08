import { StatusCodes as httpStatus } from "http-status-codes";
import Table from "./table.model";
import AppError from "../../helpers/AppError";
import { ITable } from "./table.interface";

const listTables = async () => Table.find().sort({ number: 1 });

const createTable = async (payload: Pick<ITable, "number">) => {
  const exists = await Table.findOne({ number: payload.number });

  if (exists)
    throw new AppError(httpStatus.CONFLICT, "Table number already exists");
  return Table.create(payload);
};

const updateTable = async (id: string, payload: Partial<ITable>) => {
  const table = await Table.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!table) throw new AppError(httpStatus.NOT_FOUND, "Table not found");
  return table;
};

const deleteTable = async (id: string) => {
  const table = await Table.findByIdAndDelete(id);
  if (!table) throw new AppError(httpStatus.NOT_FOUND, "Table not found");
};
export const TableServices = {
  listTables,
  createTable,
  updateTable,
  deleteTable,
};
