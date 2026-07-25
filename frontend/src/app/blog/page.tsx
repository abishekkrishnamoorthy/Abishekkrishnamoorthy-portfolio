import type { Metadata } from "next";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { site } from "@/constants/site";

export const metadata: Metadata = {
  title: `Developer Journal - ${site.name}`,
  description: "Project updates, technical articles, deployment guides, AI experiments and learning notes.",
  alternates: { canonical: `${site.url}/blog` },
};

export default function BlogPage() {
  return <BlogIndexClient />;
}
