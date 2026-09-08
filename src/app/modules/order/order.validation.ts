import { z } from "zod";

export const createOrderValidation = z.object({
  orderType: z.enum(["dine-in", "walk-in"]),
  table: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, "menuItemId is required"),
        quantity: z
          .number()
          .int()
          .positive("quantity must be a positive integer"),
        notes: z.string().optional(),
      }),
    )
    .min(1, "Order must contain at least one item"),
});
export const kitchenStatusValidation = z.object({
  status: z.enum(["preparing", "ready"], {
    message: "Kitchen can only set status to preparing or ready",
  }),
});
