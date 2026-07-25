import { cloudinary } from "@/config/cloudinary.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { mediaRepository } from "@/modules/media/media.repository.js";

function collectUrls(value: unknown, urls = new Set<string>()) {
  if (typeof value === "string") {
    if (/^(https?:\/\/|\/)/.test(value)) urls.add(value);
    return urls;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectUrls(item, urls));
    return urls;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (/url|src|href/i.test(key)) collectUrls(item, urls);
      if (typeof item === "object") collectUrls(item, urls);
    });
  }
  return urls;
}

export const mediaService = {
  signUpload(folder: string) {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, cloudinary.config().api_secret ?? "");
    return { timestamp, folder, signature, cloudName: cloudinary.config().cloud_name, apiKey: cloudinary.config().api_key };
  },
  createAsset(data: unknown) {
    return mediaRepository.create(data);
  },
  listAssets(folder?: string) {
    return mediaRepository.list(folder);
  },
  async deleteAsset(id: string) {
    const asset = await mediaRepository.findById(id);
    if (!asset) return null;
    try {
      await cloudinary.uploader.destroy(asset.publicId);
      await asset.deleteOne();
      await invalidatePublicCache();
      return { id, deleted: true };
    } catch {
      asset.deleteFailed = true;
      await asset.save();
      return { id, deleted: false, deleteFailed: true };
    }
  },
  async clearUsageForDocument(collection: string, documentId: string) {
    await mediaRepository.clearUsage(collection, documentId);
  },
  async syncUsageForDocument(collection: string, documentId: string, payload: unknown) {
    await mediaRepository.clearUsage(collection, documentId);
    const urls = [...collectUrls(payload)];
    await mediaRepository.addUsage(urls, { collection, documentId, field: "content" });
  },
};
