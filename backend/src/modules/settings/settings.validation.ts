import { z } from "zod";

export const settingsPayloadSchema = z.object({
  seo: z.record(z.unknown()).default({}),
  forms: z.record(z.unknown()).default({}),
  scheduling: z.record(z.unknown()).default({}),
});
