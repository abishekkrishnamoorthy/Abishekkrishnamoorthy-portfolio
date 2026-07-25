import { normalizePagination } from "@/common/pagination.js";
import { BlogArticleModel } from "@/modules/blog/blog.model.js";
import type { z } from "zod";
import type { articlePayloadSchema, blogListQuerySchema } from "@/modules/blog/blog.validation.js";

const previewProjection = "slug title excerpt category coverImageUrl publishedAt readTimeMinutes tags featured";
const relatedProjection = "slug title coverImageUrl readTimeMinutes category";
const publicFilter = { publishStatus: "published" };

export const blogRepository = {
  async list(query: z.infer<typeof blogListQuerySchema>) {
    const filter: Record<string, unknown> = { ...publicFilter };
    if (query.category) filter.category = query.category;
    if (query.search) filter.$text = { $search: query.search };
    const { skip, limit } = normalizePagination(query, { page: 1, pageSize: 9 }, 20);
    const [articles, total, featuredArticle] = await Promise.all([
      BlogArticleModel.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).select(previewProjection).lean(),
      BlogArticleModel.countDocuments(filter),
      BlogArticleModel.findOne({ ...publicFilter, featured: true }).sort({ publishedAt: -1 }).select(previewProjection).lean(),
    ]);
    return { featuredArticle: featuredArticle ?? articles[0] ?? null, articles, total };
  },
  async findBySlug(slug: string) {
    const article = await BlogArticleModel.findOne({ slug, ...publicFilter }).lean();
    if (!article) return null;
    const [relatedArticles, previous, next] = await Promise.all([
      BlogArticleModel.find({
        ...publicFilter,
        slug: { $ne: slug },
        $or: [{ category: article.category }, { tags: { $in: article.tags } }],
      })
        .sort({ publishedAt: -1 })
        .limit(2)
        .select(relatedProjection)
        .lean(),
      BlogArticleModel.findOne({ ...publicFilter, publishedAt: { $gt: article.publishedAt } }).sort({ publishedAt: 1 }).select("slug title").lean(),
      BlogArticleModel.findOne({ ...publicFilter, publishedAt: { $lt: article.publishedAt } }).sort({ publishedAt: -1 }).select("slug title").lean(),
    ]);
    return { article, relatedArticles, previous, next };
  },
  findCmsBySlug(slug: string) {
    return BlogArticleModel.findOne({ slug });
  },
  latest(limit = 3) {
    return BlogArticleModel.find(publicFilter).sort({ publishedAt: -1 }).limit(limit).select(previewProjection).lean();
  },
  create(data: z.infer<typeof articlePayloadSchema>) {
    return BlogArticleModel.create(data);
  },
  update(slug: string, data: unknown) {
    return BlogArticleModel.findOneAndUpdate({ slug }, data as Record<string, unknown>, { new: true });
  },
  delete(slug: string) {
    return BlogArticleModel.findOneAndDelete({ slug });
  },
  cmsList() {
    return BlogArticleModel.find().sort({ publishedAt: -1 }).lean();
  },
  addBlock(slug: string, block: unknown) {
    return BlogArticleModel.findOneAndUpdate({ slug }, { $push: { blocks: block } }, { new: true });
  },
  async reorderBlocks(slug: string, blockIds: string[]) {
    const article = await BlogArticleModel.findOne({ slug });
    if (!article) return null;
    const order = new Map<string, number>(blockIds.map((id, index) => [id, index]));
    article.set(
      "blocks",
      [...(article.blocks as unknown as Array<{ id?: string }>)]
        .sort((a, b) => (order.get(a.id ?? "") ?? 999) - (order.get(b.id ?? "") ?? 999)),
    );
    await article.save();
    return article;
  },
  deleteBlock(slug: string, blockId: string) {
    return BlogArticleModel.findOneAndUpdate({ slug }, { $pull: { blocks: { id: blockId } } }, { new: true });
  },
};
