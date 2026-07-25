import type { ProjectSort } from "@/types/project.types";

export const sortOptions: { label: string; value: ProjectSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A-Z", value: "az" },
];
