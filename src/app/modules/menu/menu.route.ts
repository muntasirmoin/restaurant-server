import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createMenuItemValidation,
  updateMenuItemValidation,
} from "./menu.validation";

import {
  listMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./menu.controller";

const router = Router();

router.get("/", checkAuth(), listMenu);

router.post(
  "/",
  checkAuth("administrator"),
  validateRequest(createMenuItemValidation),
  createMenuItem,
);
router.patch(
  "/:id",
  checkAuth("administrator"),
  validateRequest(updateMenuItemValidation),
  updateMenuItem,
);

router.delete("/:id", checkAuth("administrator"), deleteMenuItem);

export const MenuRoutes = router;
