"use client";

import { useQuery } from "@tanstack/react-query";
import { getExperience } from "@/services/experience.service";

export function useExperience() {
  return useQuery({
    queryKey: ["experience"],
    queryFn: getExperience,
    staleTime: 1000 * 60 * 10,
  });
}
