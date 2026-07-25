import { z } from "zod";

export const settingsSchema = z.object({
  seo: z.record(z.unknown()).default({}),
  forms: z.record(z.unknown()).default({}),
  scheduling: z.record(z.unknown()).default({}),
});
export type SettingsFormValues = z.infer<typeof settingsSchema>;
