import { z } from "zod";
export const createUserValidation = z.object({
  name: z.string().min(1, "name is required"),
  username: z.string().min(3, "username must be at least 3 characters"),
  password: z.string().min(6, "password must be at least 6 characters"),
  role: z.enum(["administrator", "manager", "counter", "waiter", "kitchen"]),
});
export const updateUserValidation = z.object({
  name: z.string().min(1).optional(),
  role: z
    .enum(["administrator", "manager", "counter", "waiter", "kitchen"])
    .optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});
