import type { Metadata } from "next";
import { BlogDetailPageClient } from "@/components/blog/BlogDetailPageClient";
import { metadataForPath } from "@/lib/seo/metadata";
import { getBlogBySlug } from "@/services/blog.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/blog/${slug}`;
  try {
    const blog = await getBlogBySlug(slug);
    return metadataForPath(path, { title: blog.article.title, description: blog.article.excerpt, imageUrl: blog.article.coverImageUrl });
  } catch {
    return metadataForPath(path);
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogDetailPageClient slug={slug} />;
}
