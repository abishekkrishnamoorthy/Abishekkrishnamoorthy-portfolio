"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedProjects } from "@/services/project.service";

export function useFeaturedProjects() {
  return useQuery({
    queryKey: ["projects", "featured"],
    queryFn: getFeaturedProjects,
    staleTime: 1000 * 60 * 2,
  });
}
