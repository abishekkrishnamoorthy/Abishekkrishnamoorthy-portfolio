import { apiClient } from "@/services/api";
import { mapArticle, mapArticlePreview, mapArticleReference, type ArticleDto, type ArticlePreviewDto, type ArticleReferenceDto } from "@/services/mappers";
import { responseData } from "@/services/response";
import type { ApiResponse } from "@/types/common.types";
import type { BlogDetailPayload, BlogListPayload, BlogsQuery } from "@/types/blog.types";

type BlogListDto = { featuredArticle: ArticlePreviewDto | null; articles: ArticlePreviewDto[]; total: number };
type BlogDetailDto = { article: ArticleDto; relatedArticles: ArticleReferenceDto[]; previous: ArticleReferenceDto | null; next: ArticleReferenceDto | null };

export async function getBlogs(params: BlogsQuery = {}): Promise<BlogListPayload> {
  const dto = responseData(await apiClient.get<ApiResponse<BlogListDto>>("/blogs", { params }));
  return {
    featuredArticle: dto.featuredArticle ? mapArticlePreview(dto.featuredArticle) : null,
    articles: dto.articles.map(mapArticlePreview),
    total: dto.total,
  };
}

export async function getBlogBySlug(slug: string): Promise<BlogDetailPayload> {
  const dto = responseData(await apiClient.get<ApiResponse<BlogDetailDto>>(`/blogs/${encodeURIComponent(slug)}`));
  return {
    article: mapArticle(dto.article),
    relatedArticles: dto.relatedArticles.map(mapArticleReference),
    previous: dto.previous ? mapArticleReference(dto.previous) : null,
    next: dto.next ? mapArticleReference(dto.next) : null,
  };
}
