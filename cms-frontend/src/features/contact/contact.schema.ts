import { z } from "zod";
import { emailSchema } from "@/lib/validation/shared-schemas";

const visibleCard = z.object({
  label: z.string().trim().min(2).max(40),
  value: z.string().trim().min(1).max(120),
  href: z.string().trim().max(300).optional(),
  visible: z.boolean().default(true),
});

export const contactSchema = z.object({
  hero: z.object({ title: z.string().trim().min(3).max(60), description: z.string().trim().min(20).max(220) }),
  contact: z.object({
    email: visibleCard.extend({ value: emailSchema }),
    phone: visibleCard.optional(),
    location: visibleCard,
    resume: visibleCard.optional(),
    availability: z.object({ status: z.string().trim().max(40), availableFor: z.array(z.string().trim().max(24)).max(10), responseTime: z.string().trim().max(40) }).optional(),
    businessHours: z.object({ days: z.string().trim().max(60), hours: z.string().trim().max(60), timezone: z.string().trim().max(60) }).optional(),
  }),
  communicationMethods: z.array(z.object({ id: z.string().trim().min(1).max(40), type: z.enum(["phone", "meet"]), title: z.string().trim().min(3).max(60), description: z.string().trim().min(10).max(180), duration: z.string().trim().min(2).max(30), actionLabel: z.string().trim().min(2).max(32), visible: z.boolean().default(true) })),
  socialLinks: z.array(z.object({ platform: z.string().trim().min(1).max(40), username: z.string().trim().max(60).optional(), profileUrl: z.string().trim().max(300).optional(), icon: z.string().trim().min(1).max(40), displayOrder: z.number().int().min(0), visible: z.boolean().default(true) })),
});
export type ContactFormValues = z.infer<typeof contactSchema>;
