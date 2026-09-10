import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { getSalesReport } from "./report.controller";
const router = Router();
router.get("/sales", checkAuth("manager", "administrator"), getSalesReport);
export const ReportRoutes = router;
