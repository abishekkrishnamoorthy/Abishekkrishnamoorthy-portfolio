import type { MetadataRoute } from "next";
import { site } from "@/constants/site";
import { getBlogs } from "@/services/blog.service";
import { getProjects } from "@/services/project.service";
import { getSeoPages } from "@/services/seo.service";

export const revalidate = 3600;

const staticPaths = ["/", "/projects", "/blog", "/contact"];

function absoluteUrl(path: string) {
  return `${site.url}${path === "/" ? "" : path}`;
}

function isNoIndex(path: string, noIndexPaths: Set<string>) {
  return noIndexPaths.has(path);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectsResult, blogsResult, seoPages] = await Promise.allSettled([getProjects({ pageSize: 20 }), getBlogs({ pageSize: 20 }), getSeoPages()]);
  const projects = projectsResult.status === "fulfilled" ? projectsResult.value.items.map((project) => `/projects/${project.slug}`) : [];
  const blogs = blogsResult.status === "fulfilled" ? blogsResult.value.articles.map((article) => `/blog/${article.slug}`) : [];
  const pageSummaries = seoPages.status === "fulfilled" ? seoPages.value : [];
  const noIndexPaths = new Set(pageSummaries.filter((page) => page.robots?.includes("noindex")).map((page) => page.pagePath));
  const overridePaths = pageSummaries.map((page) => page.pagePath);
  const paths = [...new Set([...staticPaths, ...projects, ...blogs, ...overridePaths])].filter((path) => !isNoIndex(path, noIndexPaths));

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: pageSummaries.find((page) => page.pagePath === path)?.updatedAt ? new Date(pageSummaries.find((page) => page.pagePath === path)!.updatedAt) : new Date(),
  }));
}
