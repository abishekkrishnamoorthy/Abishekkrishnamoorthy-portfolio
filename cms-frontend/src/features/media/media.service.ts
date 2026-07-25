import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { MediaAsset } from "@/types/media.types";

type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder?: string;
};

export const mediaService = {
  signUpload: (folder: string) => axiosClient.post<unknown, { timestamp: number; folder: string; signature: string; cloudName: string; apiKey: string }>(ENDPOINTS.cmsMediaSignUpload, { folder }),
  list: (folder?: string) => axiosClient.get<unknown, MediaAsset[]>(ENDPOINTS.cmsMedia, { params: folder ? { folder } : undefined }),
  create: (body: Omit<MediaAsset, "_id" | "usedIn" | "deleteFailed">) => axiosClient.post<unknown, MediaAsset>(ENDPOINTS.cmsMedia, body),
  delete: (id: string) => axiosClient.delete<unknown, { id: string; deleted: boolean }>(ENDPOINTS.cmsMediaAsset(id)),
  upload: async ({ file, folder }: { file: File; folder: string }) => {
    const signed = await mediaService.signUpload(folder || "portfolio");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("api_key", signed.apiKey);
    formData.set("timestamp", String(signed.timestamp));
    formData.set("folder", signed.folder);
    formData.set("signature", signed.signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, { method: "POST", body: formData });
    if (!response.ok) throw new Error("Cloudinary upload failed");
    const uploaded = (await response.json()) as CloudinaryUploadResponse;
    return mediaService.create({
      publicId: uploaded.public_id,
      url: uploaded.url,
      secureUrl: uploaded.secure_url,
      folder: uploaded.folder ?? signed.folder,
      resourceType: uploaded.resource_type,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
    });
  },
};
