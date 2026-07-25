import { AppError } from "@/common/AppError.js";
import { cloudinary } from "@/config/cloudinary.js";
import { logger } from "@/config/logger.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { mediaService } from "@/modules/media/media.service.js";
import { projectsRepository } from "@/modules/projects/projects.repository.js";
import type { z } from "zod";
import type { projectHeaderImageUploadSchema, projectHeaderSchema, projectListQuerySchema } from "@/modules/projects/projects.validation.js";

const maxShowcaseImageBytes = 5 * 1024 * 1024;
const allowedShowcaseImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function summarizeShowcaseImages(images: Array<{ order: number; imageUrl: string; label: string }>) {
  return images.map((image) => ({
    order: image.order,
    label: image.label,
    hasImage: Boolean(image.imageUrl),
    imageUrl: image.imageUrl || undefined,
  }));
}

function assertCloudinaryConfigured() {
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new AppError(500, "CLOUDINARY_NOT_CONFIGURED", "Cloudinary is not configured.");
  }
}

function dataUrlFromUpload(upload: z.infer<typeof projectHeaderImageUploadSchema>) {
  if (!allowedShowcaseImageTypes.has(upload.mimeType)) throw new AppError(400, "UNSUPPORTED_SHOWCASE_IMAGE_TYPE", "Showcase images must be JPEG, PNG, or WEBP.");
  const prefix = `data:${upload.mimeType};base64,`;
  if (!upload.data.startsWith(prefix)) throw new AppError(400, "INVALID_SHOWCASE_IMAGE_DATA", "Showcase image upload data is invalid.");
  const base64 = upload.data.slice(prefix.length);
  const bytes = Buffer.byteLength(base64, "base64");
  if (bytes > maxShowcaseImageBytes) throw new AppError(400, "SHOWCASE_IMAGE_TOO_LARGE", "Showcase images must be 5MB or smaller.");
  return upload.data;
}

export const projectsService = {
  getHeader: projectsRepository.getHeaderOrSeed,
  async uploadHeaderImage(upload: z.infer<typeof projectHeaderImageUploadSchema>): Promise<{ imageUrl: string }> {
    const dataUrl = dataUrlFromUpload(upload);
    assertCloudinaryConfigured();
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "portfolio/projects-header",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      use_filename: true,
      unique_filename: true,
    });
    if (!result.secure_url) {
      throw new AppError(502, "CLOUDINARY_UPLOAD_FAILED", "Cloudinary did not return a showcase image URL.");
    }
    return { imageUrl: result.secure_url };
  },
  async updateHeader(data: z.infer<typeof projectHeaderSchema>) {
    logger.info({ showcaseImages: summarizeShowcaseImages(data.showcaseImages) }, "Projects header update requested");
    const result = await projectsRepository.updateHeader(data);
    logger.info({ showcaseImages: summarizeShowcaseImages(result?.showcaseImages ?? data.showcaseImages) }, "Projects header saved");
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("projectHeaderContent", "singleton", result ?? data)]);
    return result;
  },
  list: (query: z.infer<typeof projectListQuerySchema>) => projectsRepository.list(query),
  async detail(slug: string) {
    const project = await projectsRepository.findBySlug(slug);
    if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    return project;
  },
  async related(slug: string) {
    const project = await projectsRepository.findBySlug(slug);
    if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    return projectsRepository.related(slug, project.category);
  },
  cmsList: projectsRepository.cmsList,
  async create(data: unknown) {
    const result = await projectsRepository.create(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("projects", result.slug, result.toObject())]);
    return result;
  },
  async update(slug: string, data: unknown) {
    const result = await projectsRepository.update(slug, data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("projects", slug, result?.toObject() ?? data)]);
    return result;
  },
  async delete(slug: string) {
    const result = await projectsRepository.delete(slug);
    await Promise.all([invalidatePublicCache(), mediaService.clearUsageForDocument("projects", slug)]);
    return result;
  },
  async reorder(items: Array<{ slug: string; orderIndex: number }>) {
    const result = await projectsRepository.reorder(items);
    await invalidatePublicCache();
    return result;
  },
};
