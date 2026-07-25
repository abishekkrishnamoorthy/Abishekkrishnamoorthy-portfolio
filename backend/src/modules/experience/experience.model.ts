import { Schema, model, type InferSchemaType } from "mongoose";

const experienceSchema = new Schema(
  {
    role: { type: String, required: true, maxlength: 80 },
    company: { type: String, required: true, maxlength: 80 },
    location: { type: String, required: true, maxlength: 80 },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    description: { type: String, required: true, maxlength: 800 },
    techTags: { type: [String], default: [] },
    orderIndex: { type: Number, required: true, index: true },
    publishStatus: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  },
  { timestamps: true },
);

export type Experience = InferSchemaType<typeof experienceSchema>;
export const ExperienceModel = model("Experience", experienceSchema);
