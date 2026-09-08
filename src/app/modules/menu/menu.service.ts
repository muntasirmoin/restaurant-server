import { StatusCodes as httpStatus } from "http-status-codes";
import MenuItem from "./menu.model";
import AppError from "../../helpers/AppError";
import { IMenuItem } from "./menu.interface";

const listMenu = async () => MenuItem.find().sort({ category: 1, name: 1 });

const createMenuItem = async (payload: IMenuItem) => MenuItem.create(payload);

const updateMenuItem = async (id: string, payload: Partial<IMenuItem>) => {
  const item = await MenuItem.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Menu item not found");

  return item;
};
const deleteMenuItem = async (id: string) => {
  const item = await MenuItem.findByIdAndDelete(id);

  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Menu item not found");
};
export const MenuServices = {
  listMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
