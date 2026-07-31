import "dotenv/config";
import { z } from "zod";

const defaultAllowedOrigins = "http://localhost:3000,http://localhost:3001,http://localhost:5173";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_BASE_URL: z.string().url().default("http://localhost:4000"),
  ALLOWED_ORIGINS: z
    .string()
    .default(defaultAllowedOrigins)
    .transform((value, ctx) => {
      const origins = value.split(",").map((origin) => origin.trim());
      const invalidOrigin = origins.find((origin) => !origin || !z.string().url().safeParse(origin).success);

      if (invalidOrigin !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ALLOWED_ORIGINS must be a comma-separated list of valid URLs",
        });
        return z.NEVER;
      }

      return origins;
    }),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/portfolio"),
  JWT_ACCESS_SECRET: z.string().min(16).default("development-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().min(16).default("development-refresh-secret-change-me"),
  COOKIE_SECRET: z.string().min(16).default("development-cookie-secret-change-me"),
  REDIS_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(12).optional(),
  SUPER_ADMIN_NAME: z.string().min(2).optional(),
});

export const env = envSchema.parse(process.env);
