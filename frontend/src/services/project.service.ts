import { apiClient } from "@/services/api";
import { mapProject, type ProjectDto } from "@/services/mappers";
import { responseData } from "@/services/response";
import type { ApiResponse } from "@/types/common.types";
import type { Project, ProjectHeader, ProjectsPage, ProjectsQuery } from "@/types/project.types";

type ProjectsPageDto = Omit<ProjectsPage, "items"> & { items: ProjectDto[] };

export async function getProjects(params: ProjectsQuery = {}): Promise<ProjectsPage> {
  const dto = responseData(await apiClient.get<ApiResponse<ProjectsPageDto>>("/projects", { params }));
  return { ...dto, items: dto.items.map(mapProject) };
}

export async function getProjectsHeader(): Promise<ProjectHeader> {
  return responseData(await apiClient.get<ApiResponse<ProjectHeader>>("/projects/header"));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const page = await getProjects({ featured: true, limit: 3 });
  return page.items;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const dto = responseData(await apiClient.get<ApiResponse<ProjectDto>>(`/projects/${encodeURIComponent(slug)}`));
  return mapProject(dto);
}

export async function getRelatedProjects(slug: string): Promise<Project[]> {
  const items = responseData(await apiClient.get<ApiResponse<ProjectDto[]>>(`/projects/${encodeURIComponent(slug)}/related`));
  return items.map(mapProject);
}
