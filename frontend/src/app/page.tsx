import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import { site } from "@/constants/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  alternates: { canonical: site.url },
};

export default function Home() {
  
  return <HomePageClient />;
}
