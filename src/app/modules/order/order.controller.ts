import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderServices } from "./order.service";
import { OrderStatus } from "./order.interface";

export const createOrder = catchAsync(async (req, res) => {
  const order = await OrderServices.createOrder({
    ...req.body,
    createdById: req.user.userId,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created",
    data: order,
  });
});

export const confirmOrder = catchAsync(async (req, res) => {
  const order = await OrderServices.confirmOrder(
    req.params.id as string,
    req.user.userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order confirmed",
    data: order,
  });
});

export const updateKitchenStatus = catchAsync(async (req, res) => {
  const order = await OrderServices.updateKitchenStatus(
    req.params.id as string,
    req.body.status,
    req.user.userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated",
    data: order,
  });
});

export const markServed = catchAsync(async (req, res) => {
  const order = await OrderServices.markServed(
    req.params.id as string,
    req.user.userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order served",
    data: order,
  });
});

export const cancelOrder = catchAsync(async (req, res) => {
  const order = await OrderServices.cancelOrder(
    req.params.id as string,
    req.user.userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled",
    data: order,
  });
});

export const listOrders = catchAsync(async (req, res) => {
  const orders = await OrderServices.listOrders(
    req.query.status as OrderStatus | undefined,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved",
    data: orders,
  });
});

export const getOrder = catchAsync(async (req, res) => {
  const order = await OrderServices.getOrder(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved",
    data: order,
  });
});
