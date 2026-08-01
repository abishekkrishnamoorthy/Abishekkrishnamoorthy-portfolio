import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { site } from "@/constants/site";
import { metadataForPath } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/contact", { title: `Contact - ${site.name}`, description: "Schedule a call, send a message, or connect with Abishek Krishnamoorthy." });
}

export default function ContactPage() {
  return <ContactPageClient />;
}
