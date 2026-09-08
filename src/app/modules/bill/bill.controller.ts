import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BillServices } from "./bill.service";
export const generateBill = catchAsync(async (req, res) => {
  const bill = await BillServices.generateBill({
    ...req.body,
    generatedById: req.user.userId,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Bill generated",
    data: bill,
  });
});

export const listBills = catchAsync(async (req, res) => {
  const bills = await BillServices.listBills();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bills retrieved",
    data: bills,
  });
});
