import { Schema, model, type InferSchemaType } from "mongoose";
import { robotsValues } from "@/modules/settings/settings.defaults.js";

const seoSettingsSchema = new Schema(
  {
    siteName: { type: String, required: true },
    siteUrl: { type: String, required: true },
    defaultMetaTitle: { type: String, required: true },
    titleTemplate: { type: String, required: true },
    defaultMetaDescription: { type: String, required: true },
    defaultAuthor: { type: String, required: true },
    defaultRobots: { type: String, enum: robotsValues, default: "index,follow", required: true },
    googleVerificationCode: String,
    defaultOgImageUrl: String,
    defaultFaviconUrl: String,
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    seo: { type: seoSettingsSchema, default: undefined },
    forms: { type: Schema.Types.Mixed, default: {} },
    scheduling: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type Settings = InferSchemaType<typeof settingsSchema>;
export const SettingsModel = model("Settings", settingsSchema);
