import type { Metadata } from "next";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { site } from "@/constants/site";
import { metadataForPath } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/blog", { title: `Developer Journal - ${site.name}`, description: "Project updates, technical articles, deployment guides, AI experiments and learning notes." });
}

export default function BlogPage() {
  return <BlogIndexClient />;
}
