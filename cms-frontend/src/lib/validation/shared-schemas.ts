import { z } from "zod";

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const urlSchema = z.string().max(300).refine((value) => value.startsWith("/") || /^https:\/\//.test(value), {
  message: "Must be an HTTPS URL or a site-relative path",
});
export const httpsUrlSchema = z.string().url().max(300).refine((value) => value.startsWith("https://"), "Must be an HTTPS URL");
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const emailSchema = z.string().email().max(120);
export const phoneSchema = z.string().regex(/^[+\d][\d\s().-]{7,}$/).max(24);
