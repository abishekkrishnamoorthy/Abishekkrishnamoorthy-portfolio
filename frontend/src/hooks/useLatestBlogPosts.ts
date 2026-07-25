"use client";

import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "@/services/blog.service";

export function useLatestBlogPosts(limit = 3) {
  return useQuery({
    queryKey: ["blogs", "latest", limit],
    queryFn: async () => (await getBlogs({ pageSize: limit })).articles,
    staleTime: 1000 * 60 * 2,
  });
}
