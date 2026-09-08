import { z } from "zod";

export const createMenuItemValidation = z.object({
  name: z.string().min(1, "name is required"),
  category: z.string().min(1, "category is required"),
  price: z.number().positive("price must be positive"),
  available: z.boolean().optional().default(true),
});

export const updateMenuItemValidation = createMenuItemValidation.partial();
