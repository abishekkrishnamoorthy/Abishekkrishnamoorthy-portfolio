import { buildMetadata, fallbackResolvedSeo } from "@/lib/seo/buildMetadata";
import { resolveSeo } from "@/services/seo.service";

export async function metadataForPath(path: string, fallback: { title?: string; description?: string; imageUrl?: string } = {}) {
  try {
    const resolved = await resolveSeo(path);
    return buildMetadata(resolved);
  } catch {
    return buildMetadata(fallbackResolvedSeo(path, fallback));
  }
}
