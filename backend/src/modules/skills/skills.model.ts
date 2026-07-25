import { Schema, model, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    id: { type: String, required: true, enum: ["frontend", "backend", "ai-tools-cloud"] },
    title: { type: String, required: true, minlength: 3, maxlength: 24 },
    items: { type: [String], required: true, default: [] },
    orderIndex: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const learningItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, minlength: 3, maxlength: 28 },
    icon: { type: String, required: true, enum: ["Sparkles", "Cloud", "Network"], default: "Sparkles" },
    progressPercent: { type: Number, required: true, min: 0, max: 100 },
    orderIndex: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const skillsContentSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    categories: { type: [categorySchema], default: [] },
    learningItems: { type: [learningItemSchema], default: [] },
  },
  { timestamps: true },
);

export type SkillsContent = InferSchemaType<typeof skillsContentSchema>;
export const SkillsContentModel = model("SkillsContent", skillsContentSchema);
