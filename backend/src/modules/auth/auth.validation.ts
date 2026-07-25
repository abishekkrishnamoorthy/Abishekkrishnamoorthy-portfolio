import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(128),
});
