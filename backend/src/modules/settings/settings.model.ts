import { Schema, model, type InferSchemaType } from "mongoose";

const settingsSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    seo: { type: Schema.Types.Mixed, default: {} },
    forms: { type: Schema.Types.Mixed, default: {} },
    scheduling: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type Settings = InferSchemaType<typeof settingsSchema>;
export const SettingsModel = model("Settings", settingsSchema);
