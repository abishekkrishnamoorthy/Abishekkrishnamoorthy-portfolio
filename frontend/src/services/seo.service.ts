import { apiClient } from "@/services/api";
import { responseData } from "@/services/response";
import type { ApiResponse } from "@/types/common.types";
import type { GlobalSeo, ResolvedSeo, SeoPageSummary } from "@/types/seo.types";

export async function getGlobalSeo(): Promise<GlobalSeo> {
  return responseData(await apiClient.get<ApiResponse<GlobalSeo>>("/seo/global"));
}

export async function resolveSeo(path: string): Promise<ResolvedSeo> {
  return responseData(await apiClient.get<ApiResponse<ResolvedSeo>>("/seo/resolve", { params: { path } }));
}

export async function getSeoPages(): Promise<SeoPageSummary[]> {
  return responseData(await apiClient.get<ApiResponse<SeoPageSummary[]>>("/seo/pages"));
}
