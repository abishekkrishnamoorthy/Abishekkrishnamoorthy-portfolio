import { z } from "zod";

export const signUploadSchema = z.object({
  folder: z.string().trim().min(2).max(120).default("portfolio/general"),
});

export const createMediaAssetSchema = z.object({
  publicId: z.string().trim().min(1).max(180),
  url: z.string().url().max(300),
  secureUrl: z.string().url().max(300),
  folder: z.string().trim().min(2).max(120),
  resourceType: z.string().trim().max(40).default("image"),
  format: z.string().trim().max(20).optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  bytes: z.number().int().optional(),
});
