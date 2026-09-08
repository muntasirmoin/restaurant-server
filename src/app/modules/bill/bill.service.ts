import mongoose from "mongoose";
import { StatusCodes as httpStatus } from "http-status-codes";
import Order from "../order/order.model";
import Bill from "./bill.model";
import AppError from "../../helpers/AppError";
import { getIO } from "../../sockets";
interface GenerateBillInput {
  orderId: string;
  discount: number;
  taxRate: number;
  paymentMethod: "cash" | "card" | "mobile" | "unpaid";
  generatedById: string;
}
const generateBill = async (input: GenerateBillInput) => {
  const { orderId, discount, taxRate, paymentMethod, generatedById } = input;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    if (order.status !== "served") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Order must be served before billing",
      );
    }
    const subtotal = order.total;
    const taxAmount = +(subtotal * taxRate).toFixed(2);
    const total = +(subtotal + taxAmount - discount).toFixed(2);
    const [bill] = await Bill.create(
      [
        {
          order: order._id,
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          paymentMethod,
          generatedBy: generatedById,
        },
      ],
      { session },
    );
    order.status = "billed";
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    getIO().to("manager").emit("bill:generated", bill);
    return bill;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
const listBills = async () =>
  Bill.find().sort({ createdAt: -1 }).populate("order generatedBy");
export const BillServices = { generateBill, listBills };
