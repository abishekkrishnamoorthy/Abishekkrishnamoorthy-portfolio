import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ProjectFormValues } from "@/features/projects/projects.schema";
import type { Project, ProjectHeader } from "@/types/project.types";

export const projectsService = {
  getHeader: () => axiosClient.get<unknown, ProjectHeader>(ENDPOINTS.cmsProjectsHeader),
  updateHeader: (body: Omit<ProjectHeader, "_id">) => axiosClient.put<unknown, ProjectHeader>(ENDPOINTS.cmsProjectsHeader, body),
  uploadHeaderImage: (body: { fileName: string; mimeType: string; data: string }) => axiosClient.post<unknown, { imageUrl: string }>(ENDPOINTS.cmsProjectsHeaderImage, body, { timeout: 60000 }),
  list: () => axiosClient.get<unknown, Project[]>(ENDPOINTS.cmsProjects),
  create: (body: ProjectFormValues) => axiosClient.post<unknown, Project>(ENDPOINTS.cmsProjects, body),
  update: (slug: string, body: Partial<ProjectFormValues>) => axiosClient.put<unknown, Project>(ENDPOINTS.cmsProject(slug), body),
  delete: (slug: string) => axiosClient.delete<unknown, Project>(ENDPOINTS.cmsProject(slug)),
  publish: (slug: string, publishStatus: "draft" | "published") => axiosClient.patch<unknown, Project>(ENDPOINTS.cmsProjectPublish(slug), { publishStatus }),
  reorder: (items: Array<{ slug: string; orderIndex: number }>) => axiosClient.patch<unknown, Project[]>(ENDPOINTS.cmsProjectsReorder, { items }),
};
