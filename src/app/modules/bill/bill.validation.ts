import { z } from "zod";
export const generateBillValidation = z.object({
  orderId: z.string().min(1, "orderId is required"),
  discount: z.number().min(0).optional().default(0),
  taxRate: z.number().min(0).max(1).optional().default(0.05),
  paymentMethod: z
    .enum(["cash", "card", "mobile", "unpaid"])
    .optional()
    .default("unpaid"),
});
