"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentlyLearning, getSkills } from "@/services/skill.service";

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCurrentlyLearning() {
  return useQuery({
    queryKey: ["skills", "learning"],
    queryFn: getCurrentlyLearning,
    staleTime: 1000 * 60 * 10,
  });
}
