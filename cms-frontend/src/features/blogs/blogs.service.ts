import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { BlogFormValues } from "@/features/blogs/blogs.schema";
import type { ArticleBlock, BlogArticle } from "@/types/blog.types";

export const blogsService = {
  list: () => axiosClient.get<unknown, BlogArticle[]>(ENDPOINTS.cmsBlogs),
  create: (body: BlogFormValues) => axiosClient.post<unknown, BlogArticle>(ENDPOINTS.cmsBlogs, body),
  update: (slug: string, body: Partial<BlogFormValues>) => axiosClient.put<unknown, BlogArticle>(ENDPOINTS.cmsBlog(slug), body),
  publish: (slug: string, publishStatus: "draft" | "published") => axiosClient.patch<unknown, BlogArticle>(ENDPOINTS.cmsBlogPublish(slug), { publishStatus }),
  delete: (slug: string) => axiosClient.delete<unknown, BlogArticle>(ENDPOINTS.cmsBlog(slug)),
  addBlock: (slug: string, body: ArticleBlock) => axiosClient.post<unknown, BlogArticle>(ENDPOINTS.cmsBlogBlocks(slug), body),
  reorderBlocks: (slug: string, blockIds: string[]) => axiosClient.patch<unknown, BlogArticle>(ENDPOINTS.cmsBlogBlocksReorder(slug), { blockIds }),
  deleteBlock: (slug: string, blockId: string) => axiosClient.delete<unknown, BlogArticle>(ENDPOINTS.cmsBlogBlock(slug, blockId)),
};
