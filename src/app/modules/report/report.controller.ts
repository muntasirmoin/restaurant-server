import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReportServices } from "./report.service";

export const getSalesReport = catchAsync(async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const report = await ReportServices.getSalesReport(from, to);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales report retrieved",
    data: report,
  });
});
