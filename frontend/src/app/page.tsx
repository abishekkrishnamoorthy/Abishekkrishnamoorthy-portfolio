import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import { site } from "@/constants/site";
import { metadataForPath } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/", { title: site.name, description: site.description });
}

export default function Home() {
  
  return <HomePageClient />;
}
