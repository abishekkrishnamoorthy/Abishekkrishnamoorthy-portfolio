import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .max(300)
  .refine((value) => !value || z.string().url().safeParse(value).success, "Must be a valid URL");

const optionalEmailSchema = z
  .string()
  .trim()
  .max(120)
  .refine((value) => !value || z.string().email().safeParse(value).success, "Must be a valid email address");

export const homeHeroSchema = z.object({
  roleBadge: z.string().trim().min(2).max(80),
  headline: z.string().trim().min(10).max(60),
  highlightedHeadline: z.string().trim().min(5).max(32),
  subheadline: z.string().trim().min(40).max(220),
  cta: z.object({
    primaryLabel: z.string().trim().min(2).max(20),
    secondaryLabel: z.string().trim().min(2).max(20),
  }),
  status: z.object({
    enabled: z.boolean(),
    text: z.string().trim().min(2).max(60),
  }),
  socialLinks: z.object({
    linkedIn: optionalUrlSchema,
    gitHub: optionalUrlSchema,
    email: optionalEmailSchema,
  }),
});

export const updateHomeSchema = z.object({ hero: homeHeroSchema });
