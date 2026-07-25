import { BlogDetailPageClient } from "@/components/blog/BlogDetailPageClient";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogDetailPageClient slug={slug} />;
}
