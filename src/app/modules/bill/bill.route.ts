import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { generateBillValidation } from "./bill.validation";
import { downloadReceipt, generateBill, listBills } from "./bill.controller";
const router = Router();
router.post(
  "/",
  checkAuth("counter", "manager"),
  validateRequest(generateBillValidation),
  generateBill,
);
router.get("/", checkAuth("administrator", "manager", "counter"), listBills);

router.get(
  "/:id/receipt",
  checkAuth("counter", "manager", "administrator"),
  downloadReceipt,
);

export const BillRoutes = router;
