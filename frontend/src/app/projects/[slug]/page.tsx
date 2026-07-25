import { ProjectDetailPageClient } from "@/components/project-details/ProjectDetailPageClient";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetailPageClient slug={slug} />;
}
