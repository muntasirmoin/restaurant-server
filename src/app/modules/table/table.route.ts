import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createTableValidation,
  updateTableValidation,
} from "./table.validation";
import {
  listTables,
  createTable,
  updateTable,
  deleteTable,
} from "./table.controller";

const router = Router();

router.get("/", checkAuth(), listTables);

router.post(
  "/",
  checkAuth("administrator"),
  validateRequest(createTableValidation),
  createTable,
);

router.patch(
  "/:id",
  checkAuth("administrator"),
  validateRequest(updateTableValidation),
  updateTable,
);

router.delete("/:id", checkAuth("administrator"), deleteTable);

export const TableRoutes = router;
