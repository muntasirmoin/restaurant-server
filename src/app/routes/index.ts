import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { MenuRoutes } from "../modules/menu/menu.route";
import { OrderRoutes } from "../modules/order/order.route";
import { BillRoutes } from "../modules/bill/bill.route";
import { TableRoutes } from "../modules/table/table.route";

export const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/users", route: UserRoutes },
  { path: "/menu", route: MenuRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/bills", route: BillRoutes },
  { path: "/tables", route: TableRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
