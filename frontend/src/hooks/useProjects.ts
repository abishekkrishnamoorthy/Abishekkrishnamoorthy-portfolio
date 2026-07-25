"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getProjectBySlug, getProjects, getProjectsHeader, getRelatedProjects } from "@/services/project.service";
import type { ProjectsQuery } from "@/types/project.types";

export function useProjectsHeader() {
  return useQuery({
    queryKey: ["projects-header"],
    queryFn: getProjectsHeader,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjects(params: Omit<ProjectsQuery, "page">) {
  return useInfiniteQuery({
    queryKey: ["projects", params],
    queryFn: ({ pageParam = 1 }) => getProjects({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: ["projects", slug],
    queryFn: () => getProjectBySlug(slug),
    staleTime: 1000 * 60 * 2,
  });
}

export function useRelatedProjects(slug: string) {
  return useQuery({
    queryKey: ["projects", slug, "related"],
    queryFn: () => getRelatedProjects(slug),
    staleTime: 1000 * 60 * 2,
  });
}
