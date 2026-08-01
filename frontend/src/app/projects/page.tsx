import type { Metadata } from "next";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";
import { site } from "@/constants/site";
import { metadataForPath } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/projects", { title: `Projects - ${site.name}`, description: "Browse software projects across AI, full-stack, cloud, frontend, backend, and learning." });
}

export default function ProjectsPage() {
  return <ProjectsPageContent />;
}
