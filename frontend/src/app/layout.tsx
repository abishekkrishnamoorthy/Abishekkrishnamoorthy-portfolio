import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/common/QueryProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/constants/site";
import { buildMetadata, fallbackResolvedSeo } from "@/lib/seo/buildMetadata";
import { buildPersonJsonLd, buildWebSiteJsonLd } from "@/lib/seo/structuredData";
import { getContact } from "@/services/contact.service";
import { getGlobalSeo, resolveSeo } from "@/services/seo.service";
import type { GlobalSeo } from "@/types/seo.types";

const fallbackGlobalSeo: GlobalSeo = {
  siteName: site.name,
  siteUrl: site.url,
  defaultMetaTitle: site.name,
  titleTemplate: "%page% | Abishek Krishnamoorthy",
  defaultMetaDescription: site.description,
  defaultAuthor: "Abishek Krishnamoorthy",
  defaultRobots: "index,follow",
  defaultOgImageUrl: site.defaultOgImage,
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    return { metadataBase: new URL(site.url), ...buildMetadata(await resolveSeo("/")) };
  } catch {
    return { metadataBase: new URL(site.url), ...buildMetadata(fallbackResolvedSeo("/")) };
  }
}

async function layoutSeoData() {
  try {
    const [globalSeo, contact] = await Promise.all([getGlobalSeo(), getContact().catch(() => undefined)]);
    return { globalSeo, contact };
  } catch {
    return { globalSeo: fallbackGlobalSeo, contact: undefined };
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { globalSeo, contact } = await layoutSeoData();
  return (
    <html lang="en" className="dark">
      <body className="overflow-x-hidden">
        <JsonLd data={buildWebSiteJsonLd(globalSeo)} />
        <JsonLd data={buildPersonJsonLd(globalSeo, contact)} />
        <QueryProvider>
          <SiteShell>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}
