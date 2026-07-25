import { describe, expect, it } from "vitest";
import { projectHeaderSchema } from "@/modules/projects/projects.validation.js";
import { projectsService } from "@/modules/projects/projects.service.js";

const validHeader = {
  badge: "My Work",
  title: "Projects that solve",
  highlightText: "real world problems.",
  description: "A focused catalog of full-stack, AI, cloud, frontend, backend, and learning projects.",
  showcaseImages: [
    { imageUrl: "", label: "Image Card 1", order: 1 },
    { imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/card-2.webp", label: "Image Card 2", order: 2 },
    { imageUrl: "", label: "Image Card 3", order: 3 },
    { imageUrl: "", label: "Image Card 4", order: 4 },
    { imageUrl: "", label: "Image Card 5", order: 5 },
  ],
};

describe("projectHeaderSchema", () => {
  it("accepts five ordered showcase slots with an optional empty accent slot", () => {
    expect(projectHeaderSchema.safeParse(validHeader).success).toBe(true);
  });

  it("rejects invalid image URLs", () => {
    const result = projectHeaderSchema.safeParse({
      ...validHeader,
      showcaseImages: validHeader.showcaseImages.map((image) => (image.order === 1 ? { ...image, imageUrl: "not-a-url" } : image)),
    });
    expect(result.success).toBe(false);
  });

  it("requires exactly five unique showcase orders", () => {
    const result = projectHeaderSchema.safeParse({
      ...validHeader,
      showcaseImages: validHeader.showcaseImages.slice(0, 3),
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported showcase image upload types before Cloudinary upload", async () => {
    await expect(projectsService.uploadHeaderImage({ fileName: "card.gif", mimeType: "image/gif", data: "data:image/gif;base64,abc" } as never)).rejects.toMatchObject({
      code: "UNSUPPORTED_SHOWCASE_IMAGE_TYPE",
    });
  });

  it("rejects showcase image uploads over 5MB before Cloudinary upload", async () => {
    const data = `data:image/png;base64,${Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64")}`;
    await expect(projectsService.uploadHeaderImage({ fileName: "card.png", mimeType: "image/png", data })).rejects.toMatchObject({
      code: "SHOWCASE_IMAGE_TOO_LARGE",
    });
  });
});
