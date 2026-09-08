import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TableServices } from "./table.service";

export const listTables = catchAsync(async (req, res) => {
  const tables = await TableServices.listTables();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tables retrieved",
    data: tables,
  });
});

export const createTable = catchAsync(async (req, res) => {
  const table = await TableServices.createTable(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Table created",
    data: table,
  });
});

export const updateTable = catchAsync(async (req, res) => {
  const table = await TableServices.updateTable(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Table updated",
    data: table,
  });
});

export const deleteTable = catchAsync(async (req, res) => {
  await TableServices.deleteTable(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Table deleted",
    data: null,
  });
});
