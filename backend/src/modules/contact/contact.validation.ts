import { z } from "zod";
import { emailSchema, phoneSchema } from "@/common/validation.js";
import { meetingTypes } from "@/config/constants.js";

const visibleCardSchema = z.object({
  label: z.string().trim().min(2).max(40),
  value: z.string().trim().min(1).max(120),
  href: z.string().trim().max(300).optional(),
  visible: z.boolean().default(true),
});

export const contactInfoSchema = z.object({
  hero: z.object({
    title: z.string().trim().min(3).max(60),
    description: z.string().trim().min(20).max(220),
  }),
  contact: z.object({
    email: visibleCardSchema.extend({ value: emailSchema }),
    phone: visibleCardSchema.optional(),
    location: visibleCardSchema,
    resume: visibleCardSchema.optional(),
    availability: z
      .object({
        status: z.string().trim().max(40),
        availableFor: z.array(z.string().trim().max(24)).max(10),
        responseTime: z.string().trim().max(40),
      })
      .optional(),
    businessHours: z
      .object({
        days: z.string().trim().max(60),
        hours: z.string().trim().max(60),
        timezone: z.string().trim().max(60),
      })
      .optional(),
  }),
  communicationMethods: z.array(
    z.object({
      id: z.string().trim().min(1).max(40),
      type: z.enum(meetingTypes),
      title: z.string().trim().min(3).max(60),
      description: z.string().trim().min(10).max(180),
      duration: z.string().trim().min(2).max(30),
      actionLabel: z.string().trim().min(2).max(32),
      visible: z.boolean().default(true),
    }),
  ),
  socialLinks: z.array(
    z.object({
      platform: z.enum(["GitHub", "LinkedIn", "Email", "Resume", "Location", "X", "Instagram", "Medium", "Behance"]),
      username: z.string().trim().max(60).optional(),
      profileUrl: z.string().trim().max(300).optional(),
      icon: z.string().trim().min(1).max(40),
      displayOrder: z.number().int().min(0),
      visible: z.boolean().default(true),
    }),
  ),
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  subject: z.string().trim().min(5).max(120),
  message: z.string().trim().min(20).max(2000),
  source: z.string().trim().max(80).optional(),
  website: z.string().optional(),
});

export const meetingRequestSchema = z
  .object({
    meetingType: z.enum(meetingTypes).default("phone"),
    fullName: z.string().trim().min(2).max(80),
    email: emailSchema.optional().or(z.literal("")),
    phone: phoneSchema.optional().or(z.literal("")),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string().trim().min(1).max(60).default("Asia/Kolkata"),
    purpose: z.string().trim().min(5).max(140),
    message: z.string().trim().max(1000).optional(),
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const selectedDate = new Date(`${data.preferredDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Date cannot be in the past" });
    if (data.meetingType === "phone" && !data.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone number is required" });
    if (data.meetingType === "meet" && !data.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Email address is required" });
  });

export const statusUpdateSchema = z.object({
  status: z.string().trim().min(2).max(40),
});
