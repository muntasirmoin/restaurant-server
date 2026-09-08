import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { generateBillValidation } from "./bill.validation";
import { generateBill, listBills } from "./bill.controller";
const router = Router();
router.post(
  "/",
  checkAuth("counter", "manager"),
  validateRequest(generateBillValidation),
  generateBill,
);
router.get("/", checkAuth("administrator", "manager", "counter"), listBills);
export const BillRoutes = router;
