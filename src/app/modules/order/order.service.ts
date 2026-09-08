import mongoose, { QueryFilter } from "mongoose";
import { StatusCodes as httpStatus } from "http-status-codes";
import Order from "./order.model";
import MenuItem from "../menu/menu.model";
import AppError from "../../helpers/AppError";
import { getIO } from "../../sockets";
import { IOrder, OrderStatus } from "./order.interface";
import { ALLOWED_ORDER_TRANSITIONS } from "../../constants/constants";

interface CreateOrderInput {
  orderType: "dine-in" | "walk-in";
  table?: string;
  items: { menuItemId: string; quantity: number; notes?: string }[];
  createdById: string;
}
const createOrder = async (input: CreateOrderInput) => {
  const { orderType, table, items, createdById } = input;

  const menuIds = items.map((i) => i.menuItemId);

  const menuItems = await MenuItem.find({ _id: { $in: menuIds } });
  const orderItems = items.map((i) => {
    const menuItem = menuItems.find((m) => m._id.toString() === i.menuItemId);
    if (!menuItem)
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Menu item ${i.menuItemId} not found`,
      );
    if (!menuItem.available)
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${menuItem.name} is currently unavailable`,
      );
    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: i.quantity,
      notes: i.notes,
    };
  });
  const initialStatus: OrderStatus =
    orderType === "walk-in" ? "confirmed" : "pending";
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [order] = await Order.create(
      [
        {
          orderType,
          table,
          items: orderItems,
          status: initialStatus,
          createdBy: createdById,
          confirmedBy: orderType === "walk-in" ? createdById : undefined,
        },
      ],
      { session },
    );
    await session.commitTransaction();
    session.endSession();
    const io = getIO();
    if (initialStatus === "pending") {
      io.to("counter").to("manager").emit("order:new", order);
    } else {
      io.to("kitchen").to("manager").emit("order:new", order);
    }
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const transitionOrder = async (
  orderId: string,
  nextStatus: OrderStatus,
  actorId: string,
  isConfirmStep = false,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    const allowed = ALLOWED_ORDER_TRANSITIONS[order.status];
    if (!allowed.includes(nextStatus)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot move order from ${order.status} to ${nextStatus}`,
      );
    }
    order.status = nextStatus;
    if (isConfirmStep)
      order.confirmedBy = actorId as unknown as mongoose.Types.ObjectId;
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
const confirmOrder = async (orderId: string, counterUserId: string) => {
  const order = await transitionOrder(
    orderId,
    "confirmed",
    counterUserId,
    true,
  );
  getIO()
    .to("kitchen")
    .to("waiter")
    .to("manager")
    .emit("order:confirmed", order);
  return order;
};

const updateKitchenStatus = async (
  orderId: string,
  status: "preparing" | "ready",
  kitchenUserId: string,
) => {
  const order = await transitionOrder(orderId, status, kitchenUserId);
  getIO()
    .to("counter")
    .to("waiter")
    .to("manager")
    .emit("order:kitchenUpdate", order);
  return order;
};
const markServed = async (orderId: string, actorId: string) => {
  const order = await transitionOrder(orderId, "served", actorId);
  getIO().to("counter").to("manager").emit("order:served", order);
  return order;
};
const cancelOrder = async (orderId: string, actorId: string) => {
  const order = await transitionOrder(orderId, "cancelled", actorId);
  getIO()
    .to("kitchen")
    .to("waiter")
    .to("counter")
    .to("manager")
    .emit("order:cancelled", order);
  return order;
};
const listOrders = async (status?: OrderStatus) => {
  const filter: QueryFilter<IOrder> = status ? { status } : {};
  return Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("table createdBy confirmedBy");
};
const getOrder = async (orderId: string) => {
  const order = await Order.findById(orderId).populate(
    "table createdBy confirmedBy",
  );
  if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};
export const OrderServices = {
  createOrder,
  confirmOrder,
  updateKitchenStatus,
  markServed,
  cancelOrder,
  listOrders,
  getOrder,
};
