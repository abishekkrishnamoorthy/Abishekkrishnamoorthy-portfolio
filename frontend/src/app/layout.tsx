import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/common/QueryProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import { site } from "@/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    images: [site.defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <SiteShell>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}
