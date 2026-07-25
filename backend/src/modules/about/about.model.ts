import { Schema, model, type InferSchemaType } from "mongoose";

const blockSchema = new Schema({}, { _id: false, strict: false });

const aboutContentSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    bio: { type: [blockSchema], default: [] },
    profileImage: {
      url: String,
      alt: String,
    },
    resumeUrl: String,
    highlights: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type AboutContent = InferSchemaType<typeof aboutContentSchema>;
export const AboutContentModel = model("AboutContent", aboutContentSchema);
