import { Schema, model, type InferSchemaType } from "mongoose";
import { robotsValues } from "@/modules/settings/settings.defaults.js";

const seoOverrideSchema = new Schema(
  {
    pagePath: { type: String, required: true, unique: true, index: true },
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 180 },
    ogImageUrl: String,
    canonicalUrl: String,
    ogTitle: { type: String, maxlength: 70 },
    ogDescription: { type: String, maxlength: 180 },
    robots: { type: String, enum: robotsValues },
  },
  { timestamps: true },
);

export type SeoOverride = InferSchemaType<typeof seoOverrideSchema>;
export const SeoOverrideModel = model("SeoOverride", seoOverrideSchema);
