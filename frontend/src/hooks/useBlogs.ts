"use client";

import { useQuery } from "@tanstack/react-query";
import { getBlogBySlug, getBlogs } from "@/services/blog.service";
import type { BlogsQuery } from "@/types/blog.types";

export function useBlogs(params: BlogsQuery) {
  return useQuery({ queryKey: ["blogs", params], queryFn: () => getBlogs(params), staleTime: 1000 * 60 * 2 });
}

export function useBlogBySlug(slug: string) {
  return useQuery({ queryKey: ["blogs", slug], queryFn: () => getBlogBySlug(slug), enabled: Boolean(slug), staleTime: 1000 * 60 * 2 });
}
