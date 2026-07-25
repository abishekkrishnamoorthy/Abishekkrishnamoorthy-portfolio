"use client";

import { useQuery } from "@tanstack/react-query";
import { getHome } from "@/services/home.service";

export function useHome() {
  return useQuery({ queryKey: ["home"], queryFn: getHome, staleTime: 1000 * 60 * 5 });
}
