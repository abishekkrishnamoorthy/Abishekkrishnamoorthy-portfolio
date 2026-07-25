import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { site } from "@/constants/site";

export const metadata: Metadata = {
  title: `Contact - ${site.name}`,
  description: "Schedule a call, send a message, or connect with Abishek Krishnamoorthy.",
  alternates: { canonical: `${site.url}/contact` },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
