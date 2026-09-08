import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { MenuServices } from "./menu.service";

export const listMenu = catchAsync(async (req, res) => {
  const items = await MenuServices.listMenu();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu retrieved",
    data: items,
  });
});

export const createMenuItem = catchAsync(async (req, res) => {
  const item = await MenuServices.createMenuItem(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Menu item created",
    data: item,
  });
});
export const updateMenuItem = catchAsync(async (req, res) => {
  const item = await MenuServices.updateMenuItem(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu item updated",
    data: item,
  });
});
export const deleteMenuItem = catchAsync(async (req, res) => {
  await MenuServices.deleteMenuItem(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Menu item deleted",
    data: null,
  });
});
