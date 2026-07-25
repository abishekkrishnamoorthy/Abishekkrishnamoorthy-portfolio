import { Schema, model, type InferSchemaType } from "mongoose";

const seoOverrideSchema = new Schema(
  {
    pagePath: { type: String, required: true, unique: true },
    metaTitle: { type: String, required: true, maxlength: 70 },
    metaDescription: { type: String, required: true, maxlength: 180 },
    ogImageUrl: String,
    canonicalUrl: String,
  },
  { timestamps: true },
);

export type SeoOverride = InferSchemaType<typeof seoOverrideSchema>;
export const SeoOverrideModel = model("SeoOverride", seoOverrideSchema);
