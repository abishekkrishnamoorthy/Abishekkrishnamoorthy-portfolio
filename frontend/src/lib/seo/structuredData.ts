import type { ContactContent } from "@/types/contact.types";
import type { GlobalSeo } from "@/types/seo.types";

function cleanEntries<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== "" && (!Array.isArray(entry) || entry.length > 0)));
}

export function buildWebSiteJsonLd(globalSeo: GlobalSeo) {
  return cleanEntries({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: globalSeo.siteName,
    url: globalSeo.siteUrl,
  });
}

export function buildPersonJsonLd(globalSeo: GlobalSeo, contact?: ContactContent) {
  const sameAs = contact?.socialLinks.filter((link) => link.visible && link.profileUrl).sort((a, b) => a.displayOrder - b.displayOrder).map((link) => link.profileUrl as string);
  return cleanEntries({
    "@context": "https://schema.org",
    "@type": "Person",
    name: globalSeo.defaultAuthor,
    url: globalSeo.siteUrl,
    email: contact?.contact.email.visible ? contact.contact.email.value : undefined,
    sameAs,
  });
}
