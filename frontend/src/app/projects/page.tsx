import type { Metadata } from "next";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";
import { site } from "@/constants/site";

export const metadata: Metadata = {
  title: `Projects - ${site.name}`,
  description: "Browse software projects across AI, full-stack, cloud, frontend, backend, and learning.",
};

export default function ProjectsPage() {
  return <ProjectsPageContent />;
}
