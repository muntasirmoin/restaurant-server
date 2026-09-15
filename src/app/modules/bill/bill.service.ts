import mongoose from "mongoose";
import { StatusCodes as httpStatus } from "http-status-codes";
import Order from "../order/order.model";
import Bill from "./bill.model";
import AppError from "../../helpers/AppError";
import { getIO } from "../../sockets";

import PDFDocument from "pdfkit";
import { Response } from "express";

import { QueryFilter } from "mongoose";
import { IBill } from "./bill.interface";

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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const countToday = await Bill.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).session(session);
    const billNumber = countToday + 1;

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
          billNumber,
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
const listBills = async (date?: string) => {
  const filter: QueryFilter<IBill> = {};
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }
  return Bill.find(filter)
    .sort({ createdAt: -1 })
    .populate("order generatedBy");
};

const streamBillReceipt = async (
  billId: string,
  res: Response,
  download: boolean,
) => {
  const bill = await Bill.findById(billId).populate({
    path: "order",
    populate: { path: "table createdBy confirmedBy" },
  });

  if (!bill) throw new AppError(httpStatus.NOT_FOUND, "Bill not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = bill.order as any;

  res.setHeader("Content-Type", "application/pdf");
  const disposition = download ? "attachment" : "inline";
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename=receipt-${bill._id}.pdf`,
  );

  const doc = new PDFDocument({ margin: 0, size: [350, 550] });
  doc.pipe(res);
  doc.rect(0, 0, doc.page.width, 90).fill("#0a1628");
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("Restaurant OMS", 0, 28, { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Thank you for dining with us", 0, 55, { align: "center" });
  const billDate = new Date(bill.createdAt as unknown as string);
  const dateStr = `${String(billDate.getDate()).padStart(2, "0")}-${String(billDate.getMonth() + 1).padStart(2, "0")}-${billDate.getFullYear()}`;
  let y = 112;
  doc.fillColor("#555555").fontSize(9).font("Helvetica");
  doc.text(
    `Date: ${billDate.toLocaleDateString()} Time: ${billDate.toLocaleTimeString()}`,
    30,
    y,
  );
  y += 14;
  doc.text(`Bill ID: ${dateStr}/${bill.billNumber}`, 30, y);
  y += 14;
  doc.text(`Payment: ${bill.paymentMethod.toUpperCase()}`, 30, y);
  y += 20;
  doc
    .moveTo(30, y)
    .lineTo(doc.page.width - 30, y)
    .strokeColor("#dddddd")
    .stroke();
  y += 12;
  const col = { sl: 30, item: 55, unit: 170, qty: 225, price: 260 };
  doc.fillColor("#0a1628").font("Helvetica-Bold").fontSize(9);
  doc.text("SL", col.sl, y, { width: 20, align: "center" });
  doc.text("Item", col.item, y, { width: 110, align: "center" });
  doc.text("Unit Price", col.unit, y, { width: 50, align: "center" });
  doc.text("Qty", col.qty, y, { width: 30, align: "center" });
  doc.text("Total", col.price, y, { width: 60, align: "right" });
  y += 16;
  doc
    .moveTo(30, y)
    .lineTo(doc.page.width - 30, y)
    .strokeColor("#dddddd")
    .stroke();
  y += 10; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order.items.forEach((item: any, index: number) => {
    doc.fillColor("#333333").font("Helvetica").fontSize(9);
    doc.text(`${index + 1}`, col.sl, y, { width: 20, align: "center" });
    doc.text(item.name, col.item, y, { width: 110, align: "center" });
    doc.text(`${item.price.toFixed(2)} tk`, col.unit, y, {
      width: 50,
      align: "center",
    });
    doc.text(`${item.quantity}`, col.qty, y, { width: 30, align: "center" });
    doc.text(`${(item.price * item.quantity).toFixed(2)} tk`, col.price, y, {
      width: 60,
      align: "right",
    });
    y += 16;
  });
  y += 6;
  doc
    .moveTo(30, y)
    .lineTo(doc.page.width - 30, y)
    .strokeColor("#dddddd")
    .stroke();
  y += 14;
  const totalsRow = (label: string, value: string, bold = false) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 13 : 10)
      .fillColor(bold ? "#0a1628" : "#555555");
    doc.text(label, 30, y, { width: 210 });
    doc.text(value, 240, y, { width: 80, align: "right" });
    y += bold ? 22 : 16;
  };
  totalsRow("Subtotal", `${bill.subtotal.toFixed(2)} tk`);
  totalsRow("Tax", `${bill.taxAmount.toFixed(2)} tk`);
  totalsRow("Discount", `-${bill.discount.toFixed(2)} tk`);
  y += 4;
  doc
    .moveTo(30, y)
    .lineTo(doc.page.width - 30, y)
    .strokeColor("#0a1628")
    .lineWidth(1.5)
    .stroke();
  y += 10;
  totalsRow("Total", `${bill.total.toFixed(2)} tk`, true);
  y += 40;
  doc
    .fillColor("#999999")
    .font("Helvetica-Oblique")
    .fontSize(9)
    .text("We hope to see you again soon!", 0, y, {
      align: "center",
      width: doc.page.width,
    });
  doc.end();
};

export const BillServices = { generateBill, listBills, streamBillReceipt };
