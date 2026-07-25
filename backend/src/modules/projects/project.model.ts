import { Schema, model, type InferSchemaType } from "mongoose";
import { projectCategories, projectStatuses, publishStatuses } from "@/config/constants.js";

const techStackRowSchema = new Schema({ category: String, technologies: String }, { _id: false });
const galleryImageSchema = new Schema({ url: String, caption: String, alt: String, title: String, description: String }, { _id: false });
const navProjectSchema = new Schema({ slug: String, title: String }, { _id: false });
const projectHeaderShowcaseImageSchema = new Schema(
  {
    imageUrl: { type: String, default: "", maxlength: 300 },
    label: { type: String, default: "", maxlength: 40 },
    order: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    orderIndex: { type: Number, required: true, index: true },
    title: { type: String, required: true, minlength: 3, maxlength: 48 },
    tagline: { type: String, required: true, minlength: 10, maxlength: 70 },
    shortDescription: { type: String, required: true, minlength: 30, maxlength: 140 },
    description: { type: String, required: true, minlength: 40, maxlength: 220 },
    status: { type: String, enum: projectStatuses, required: true, default: "completed" },
    category: { type: String, enum: projectCategories, required: true, default: "Learning" },
    thumbnailUrl: { type: String, required: true, maxlength: 200 },
    techTags: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    liveDemoUrl: { type: String, required: true, maxlength: 200 },
    githubUrl: { type: String, required: true, maxlength: 200 },
    durationLabel: { type: String, required: true, maxlength: 24 },
    role: { type: String, required: true, maxlength: 35 },
    lastUpdatedAt: { type: String, required: true },
    techIcons: { type: [String], default: [] },
    readmeMarkdown: { type: String, required: true, maxlength: 8000 },
    projectStructure: { type: String, required: true, maxlength: 5000 },
    techStackTable: { type: [techStackRowSchema], default: [] },
    gallery: { type: [galleryImageSchema], default: [] },
    architectureNotes: { type: String, required: true, maxlength: 700 },
    challenges: { type: [String], default: [] },
    solutions: { type: [String], default: [] },
    learningOutcomes: { type: [String], default: [] },
    architectureDiagramUrl: { type: String },
    isFeatured: { type: Boolean, default: false, index: true },
    publishStatus: { type: String, enum: publishStatuses, default: "draft", index: true },
    previousProject: { type: navProjectSchema, default: null },
    nextProject: { type: navProjectSchema, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

projectSchema.index({ publishStatus: 1, isFeatured: 1, orderIndex: 1 });
projectSchema.index({ publishStatus: 1, category: 1, orderIndex: -1 });
projectSchema.index({ title: "text", tagline: "text", techTags: "text" });

export type Project = InferSchemaType<typeof projectSchema>;
export const ProjectModel = model("Project", projectSchema);

const projectHeaderContentSchema = new Schema(
  {
    _id: { type: String, default: "singleton" },
    badge: { type: String, required: true, minlength: 2, maxlength: 40 },
    title: { type: String, required: true, minlength: 3, maxlength: 70 },
    highlightText: { type: String, required: true, minlength: 3, maxlength: 70 },
    description: { type: String, required: true, minlength: 20, maxlength: 220 },
    showcaseImages: { type: [projectHeaderShowcaseImageSchema], default: [] },
  },
  { timestamps: true },
);

export type ProjectHeaderContent = InferSchemaType<typeof projectHeaderContentSchema>;
export const ProjectHeaderContentModel = model("ProjectHeaderContent", projectHeaderContentSchema);
