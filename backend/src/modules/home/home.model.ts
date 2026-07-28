import { Schema, model, type InferSchemaType } from "mongoose";

const ctaSchema = new Schema(
  {
    primaryLabel: { type: String, required: true, minlength: 2, maxlength: 20 },
    secondaryLabel: { type: String, required: true, minlength: 2, maxlength: 20 },
  },
  { _id: false },
);

const heroStatusSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    text: { type: String, required: true, minlength: 2, maxlength: 60 },
  },
  { _id: false },
);

const heroSocialLinksSchema = new Schema(
  {
    linkedIn: { type: String, maxlength: 300, default: "" },
    gitHub: { type: String, maxlength: 300, default: "" },
    email: { type: String, maxlength: 120, default: "" },
  },
  { _id: false },
);

const homeContentSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    hero: {
      roleBadge: { type: String, required: true, minlength: 2, maxlength: 80 },
      headline: { type: String, required: true, minlength: 10, maxlength: 60 },
      highlightedHeadline: { type: String, required: true, minlength: 5, maxlength: 32 },
      subheadline: { type: String, required: true, minlength: 40, maxlength: 220 },
      portraitUrl: { type: String, required: true, maxlength: 300 },
      portraitAlt: { type: String, required: true, minlength: 2, maxlength: 120 },
      backgroundUrl: { type: String, required: true, maxlength: 300 },
      cta: { type: ctaSchema, required: true },
      status: { type: heroStatusSchema, required: true },
      socialLinks: { type: heroSocialLinksSchema, required: true },
    },
  },
  { timestamps: true },
);

export type HomeContent = InferSchemaType<typeof homeContentSchema>;
export const HomeContentModel = model("HomeContent", homeContentSchema);
