import { buildMetadata, fallbackResolvedSeo, withContentFallback } from "@/lib/seo/buildMetadata";
import { resolveSeo } from "@/services/seo.service";

export async function metadataForPath(path: string, fallback: { title?: string; description?: string; imageUrl?: string } = {}) {
  try {
    const resolved = await resolveSeo(path);
    return buildMetadata(withContentFallback(resolved, fallback));
  } catch {
    return buildMetadata(fallbackResolvedSeo(path, fallback));
  }
}
