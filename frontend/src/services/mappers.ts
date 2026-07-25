import type { Article, ArticlePreview, ArticleReference } from "@/types/blog.types";
import type { Project } from "@/types/project.types";

export type ProjectDto = Omit<Project, "id"> & { _id: string };
export type ArticleDto = Omit<Article, "id"> & { _id: string };
export type ArticlePreviewDto = ArticlePreview & { _id?: string };
export type ArticleReferenceDto = ArticleReference & { _id?: string };

export function mapProject(project: ProjectDto): Project {
  const { _id, ...fields } = project;
  return { ...fields, id: _id };
}

export function mapArticle(article: ArticleDto): Article {
  const { _id, ...fields } = article;
  return { ...fields, id: _id };
}

export function mapArticlePreview(article: ArticlePreviewDto): ArticlePreview {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    category: article.category,
    publishedAt: article.publishedAt,
    readTimeMinutes: article.readTimeMinutes,
    tags: article.tags,
  };
}

export function mapArticleReference(article: ArticleReferenceDto): ArticleReference {
  return {
    slug: article.slug,
    title: article.title,
    coverImageUrl: article.coverImageUrl,
    readTimeMinutes: article.readTimeMinutes,
    category: article.category,
  };
}
