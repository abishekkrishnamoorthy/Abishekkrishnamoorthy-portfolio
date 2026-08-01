import type { Metadata } from "next";
import { ProjectDetailPageClient } from "@/components/project-details/ProjectDetailPageClient";
import { metadataForPath } from "@/lib/seo/metadata";
import { getProjectBySlug } from "@/services/project.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/projects/${slug}`;
  try {
    const project = await getProjectBySlug(slug);
    return metadataForPath(path, { title: project?.title, description: project?.shortDescription || project?.description, imageUrl: project?.thumbnailUrl });
  } catch {
    return metadataForPath(path);
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetailPageClient slug={slug} />;
}
