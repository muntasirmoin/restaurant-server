import mongoose from "mongoose";
import { StatusCodes as httpStatus } from "http-status-codes";
import Order from "../order/order.model";
import Bill from "./bill.model";
import AppError from "../../helpers/AppError";
import { getIO } from "../../sockets";

import PDFDocument from "pdfkit";
import { Response } from "express"; 


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


const streamBillReceipt = async (billId: string, res: Response) => {
  const bill = await Bill.findById(billId).populate({
    path: "order",
    populate: { path: "table createdBy confirmedBy" },
  });

  if (!bill) throw new AppError(httpStatus.NOT_FOUND, "Bill not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = bill.order as any;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${bill._id}.pdf`,
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(18).text("Restaurant OMS", { align: "center" });
  doc.fontSize(10).text("Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(10);
  doc.text(`Bill ID: ${bill._id}`);
  doc.text(
    `Date: ${new Date(bill.createdAt as unknown as string).toLocaleString()}`,
  );
  doc.text(`Payment method: ${bill.paymentMethod}`);
  doc.moveDown();
  doc.fontSize(12).text("Items", { underline: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order.items.forEach((item: any) => {
    doc
      .fontSize(10)
      .text(
        `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`,
      );
  });

  doc.moveDown();
  doc.fontSize(10).text(`Subtotal: $${bill.subtotal.toFixed(2)}`);
  doc.text(`Tax: $${bill.taxAmount.toFixed(2)}`);
  doc.text(`Discount: -$${bill.discount.toFixed(2)}`);
  doc.fontSize(12).text(`Total: $${bill.total.toFixed(2)}`, { underline: true });
  doc.moveDown(2);
  doc.fontSize(9).text("Thank you for dining with us!", { align: "center" });
  doc.end();
};



export const BillServices = { generateBill, listBills, streamBillReceipt };
