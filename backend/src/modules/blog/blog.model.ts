import { Schema, model, type InferSchemaType } from "mongoose";

const articleBlockSchema = new Schema(
  {
    id: { type: String, required: true, maxlength: 60 },
    type: { type: String, required: true },
  },
  { _id: false, strict: false },
);

const blogArticleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, minlength: 8, maxlength: 72 },
    excerpt: { type: String, required: true, minlength: 40, maxlength: 180 },
    category: { type: String, required: true, maxlength: 20 },
    publishedAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    readTimeMinutes: { type: Number, required: true, min: 1, max: 60 },
    author: { type: String, required: true, default: "Abishek Krishnamoorthy", maxlength: 60 },
    tags: { type: [String], default: [] },
    coverImageUrl: { type: String },
    seoTitle: { type: String, maxlength: 72 },
    seoDescription: { type: String, maxlength: 180 },
    canonicalUrl: { type: String },
    ogImageUrl: { type: String },
    blocks: { type: [articleBlockSchema], default: [] },
    editorDocument: { type: [Schema.Types.Mixed], default: [] },
    featured: { type: Boolean, default: false, index: true },
    publishStatus: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  },
  { timestamps: true, strict: true },
);

blogArticleSchema.index({ publishStatus: 1, publishedAt: -1 });
blogArticleSchema.index({ publishStatus: 1, category: 1 });
blogArticleSchema.index({ title: "text", excerpt: "text", tags: "text" });

export type BlogArticle = InferSchemaType<typeof blogArticleSchema>;
export const BlogArticleModel = model("BlogArticle", blogArticleSchema);
