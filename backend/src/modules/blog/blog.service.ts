import { AppError } from "@/common/AppError.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { calculateReadTimeMinutes } from "@/jobs/readTimeCalculator.js";
import { blogRepository } from "@/modules/blog/blog.repository.js";
import { mediaService } from "@/modules/media/media.service.js";
import type { z } from "zod";
import type { articlePayloadSchema, blogListQuerySchema } from "@/modules/blog/blog.validation.js";

export const blogService = {
  list: (query: z.infer<typeof blogListQuerySchema>) => blogRepository.list(query),
  async detail(slug: string) {
    const result = await blogRepository.findBySlug(slug);
    if (!result) throw new AppError(404, "ARTICLE_NOT_FOUND", "Article not found");
    return result;
  },
  latest: blogRepository.latest,
  cmsList: blogRepository.cmsList,
  async create(data: z.infer<typeof articlePayloadSchema>) {
    const result = await blogRepository.create({ ...data, readTimeMinutes: data.readTimeMinutes ?? calculateReadTimeMinutes(data.blocks) });
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("blogArticles", result.slug, result.toObject())]);
    return result;
  },
  async update(slug: string, data: Partial<z.infer<typeof articlePayloadSchema>>) {
    const payload = data.blocks ? { ...data, readTimeMinutes: data.readTimeMinutes ?? calculateReadTimeMinutes(data.blocks) } : data;
    const result = await blogRepository.update(slug, payload);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("blogArticles", slug, result?.toObject() ?? payload)]);
    return result;
  },
  async publish(slug: string, publishStatus: "draft" | "published") {
    if (publishStatus === "published") {
      const article = await blogRepository.findCmsBySlug(slug);
      if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Article not found");
      if (!article.blocks.length) throw new AppError(400, "ARTICLE_NOT_READY", "Published articles need at least one content block.");
    }
    const result = await blogRepository.update(slug, { publishStatus });
    await invalidatePublicCache();
    return result;
  },
  async delete(slug: string) {
    const result = await blogRepository.delete(slug);
    await Promise.all([invalidatePublicCache(), mediaService.clearUsageForDocument("blogArticles", slug)]);
    return result;
  },
  async addBlock(slug: string, block: unknown) {
    const article = await blogRepository.addBlock(slug, block);
    if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Article not found");
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("blogArticles", slug, article.toObject())]);
    return article;
  },
  async reorderBlocks(slug: string, blockIds: string[]) {
    const article = await blogRepository.reorderBlocks(slug, blockIds);
    if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Article not found");
    await invalidatePublicCache();
    return article;
  },
  async deleteBlock(slug: string, blockId: string) {
    const article = await blogRepository.deleteBlock(slug, blockId);
    if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Article not found");
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("blogArticles", slug, article.toObject())]);
    return article;
  },
};
