import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createOrderValidation,
  kitchenStatusValidation,
} from "./order.validation";
import {
  createOrder,
  confirmOrder,
  updateKitchenStatus,
  markServed,
  cancelOrder,
  listOrders,
  getOrder,
} from "./order.controller";
const router = Router();
router.post(
  "/",
  checkAuth("waiter", "counter"),
  validateRequest(createOrderValidation),
  createOrder,
);
router.get(
  "/",
  checkAuth("administrator", "manager", "counter", "waiter", "kitchen"),
  listOrders,
);
router.get(
  "/:id",
  checkAuth("administrator", "manager", "counter", "waiter", "kitchen"),
  getOrder,
);
router.patch("/:id/confirm", checkAuth("counter", "manager"), confirmOrder);
router.patch(
  "/:id/kitchen-status",
  checkAuth("kitchen"),
  validateRequest(kitchenStatusValidation),
  updateKitchenStatus,
);
router.patch("/:id/served", checkAuth("counter", "waiter"), markServed);
router.patch("/:id/cancel", checkAuth("counter", "manager"), cancelOrder);
export const OrderRoutes = router;
