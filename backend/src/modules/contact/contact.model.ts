import { Schema, model, type InferSchemaType } from "mongoose";

const visibleCardSchema = new Schema(
  {
    label: { type: String, required: true, maxlength: 40 },
    value: { type: String, required: true, maxlength: 120 },
    href: { type: String, maxlength: 300 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const contactDetailsSchema = new Schema(
  {
    email: { type: visibleCardSchema, required: true },
    phone: visibleCardSchema,
    location: { type: visibleCardSchema, required: true },
    resume: visibleCardSchema,
    availability: {
      status: { type: String, maxlength: 40 },
      availableFor: { type: [String], default: [] },
      responseTime: { type: String, maxlength: 40 },
    },
    businessHours: {
      days: { type: String, maxlength: 60 },
      hours: { type: String, maxlength: 60 },
      timezone: { type: String, maxlength: 60 },
    },
  },
  { _id: false },
);

const communicationMethodSchema = new Schema(
  {
    id: { type: String, required: true, maxlength: 40 },
    type: { type: String, enum: ["phone", "meet"], required: true },
    title: { type: String, required: true, maxlength: 60 },
    description: { type: String, required: true, maxlength: 180 },
    duration: { type: String, required: true, maxlength: 30 },
    actionLabel: { type: String, required: true, maxlength: 32 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const socialLinkSchema = new Schema(
  {
    platform: { type: String, required: true, maxlength: 40 },
    username: { type: String, maxlength: 60 },
    profileUrl: { type: String, maxlength: 300 },
    icon: { type: String, required: true, maxlength: 40 },
    displayOrder: { type: Number, required: true },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const contactContentSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    hero: {
      title: { type: String, required: true, maxlength: 60 },
      description: { type: String, required: true, maxlength: 220 },
    },
    contact: { type: contactDetailsSchema, required: true },
    communicationMethods: { type: [communicationMethodSchema], default: [] },
    socialLinks: { type: [socialLinkSchema], default: [] },
  },
  { timestamps: true },
);

const contactMessageSchema = new Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
    source: String,
    status: { type: String, enum: ["received", "read", "archived"], default: "received", index: true },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true },
);

const meetingRequestSchema = new Schema(
  {
    meetingType: { type: String, enum: ["phone", "meet"], required: true },
    fullName: String,
    email: String,
    phone: String,
    preferredDate: String,
    preferredTime: String,
    timezone: String,
    purpose: String,
    message: String,
    status: { type: String, enum: ["received", "reviewed", "scheduled", "declined"], default: "received", index: true },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true },
);

meetingRequestSchema.index({ email: 1, createdAt: -1 });
meetingRequestSchema.index({ status: 1, preferredDate: 1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

export type ContactContent = InferSchemaType<typeof contactContentSchema>;
export const ContactContentModel = model("ContactContent", contactContentSchema);
export const ContactMessageModel = model("ContactMessage", contactMessageSchema);
export const MeetingRequestModel = model("MeetingRequest", meetingRequestSchema);
