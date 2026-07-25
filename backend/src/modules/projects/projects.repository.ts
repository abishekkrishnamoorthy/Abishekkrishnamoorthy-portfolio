import { normalizePagination, pageMeta } from "@/common/pagination.js";
import { ProjectHeaderContentModel, ProjectModel } from "@/modules/projects/project.model.js";
import type { z } from "zod";
import type { projectHeaderSchema, projectListQuerySchema } from "@/modules/projects/projects.validation.js";

const listProjection = "-readmeMarkdown -projectStructure -techStackTable -gallery -architectureNotes -challenges -solutions -learningOutcomes -architectureDiagramUrl -createdBy -updatedBy -__v";
export const defaultProjectHeader: z.infer<typeof projectHeaderSchema> & { _id: string } = {
  _id: "singleton",
  badge: "My Work",
  title: "Projects that solve",
  highlightText: "real world problems.",
  description: "A focused catalog of full-stack, AI, cloud, frontend, backend, and learning projects.",
  showcaseImages: [
    { imageUrl: "", label: "Image Card 1", order: 1 },
    { imageUrl: "", label: "Image Card 2", order: 2 },
    { imageUrl: "", label: "Image Card 3", order: 3 },
    { imageUrl: "", label: "Image Card 4", order: 4 },
    { imageUrl: "", label: "Image Card 5", order: 5 },
  ],
};

function publicFilter() {
  return { publishStatus: "published" };
}

export const projectsRepository = {
  async getHeaderOrSeed() {
    const header = await ProjectHeaderContentModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultProjectHeader }, { upsert: true, new: true });
    if (!header) return header;

    let changed = false;
    if (!header.badge) {
      header.badge = defaultProjectHeader.badge;
      changed = true;
    }
    if (!header.title) {
      header.title = defaultProjectHeader.title;
      changed = true;
    }
    if (!header.highlightText) {
      header.highlightText = defaultProjectHeader.highlightText;
      changed = true;
    }
    if (!header.description) {
      header.description = defaultProjectHeader.description;
      changed = true;
    }

    const byOrder = new Map((header.showcaseImages ?? []).map((item) => [item.order, item]));
    const showcaseImages = defaultProjectHeader.showcaseImages.map((slot) => {
      const existing = byOrder.get(slot.order);
      return existing ? { imageUrl: existing.imageUrl ?? "", label: existing.label ?? "", order: slot.order } : slot;
    });
    if (JSON.stringify(header.showcaseImages) !== JSON.stringify(showcaseImages)) {
      header.set("showcaseImages", showcaseImages);
      changed = true;
    }

    if (changed) await header.save();
    return header.toObject();
  },
  updateHeader(data: z.infer<typeof projectHeaderSchema>) {
    return ProjectHeaderContentModel.findByIdAndUpdate("singleton", { ...data, showcaseImages: [...data.showcaseImages].sort((a, b) => a.order - b.order) }, { upsert: true, new: true }).lean();
  },
  async list(query: z.infer<typeof projectListQuerySchema>) {
    const filter: Record<string, unknown> = query.featured ? { ...publicFilter(), isFeatured: true } : publicFilter();
    if (query.category && query.category !== "All") filter.category = query.category;
    if (query.search) filter.$text = { $search: query.search };
    const sort: Record<string, 1 | -1> = query.sort === "az" ? { title: 1 } : query.sort === "oldest" ? { orderIndex: 1 } : { orderIndex: -1 };
    if (query.featured && query.limit) {
      const items = await ProjectModel.find(filter).sort({ orderIndex: 1 }).limit(query.limit).select(listProjection).lean();
      return { items, hasNextPage: false };
    }
    const { page, pageSize, skip, limit } = normalizePagination(query, { page: 1, pageSize: 5 }, 20);
    const [items, total] = await Promise.all([ProjectModel.find(filter).sort(sort).skip(skip).limit(limit).select(listProjection).lean(), ProjectModel.countDocuments(filter)]);
    return { items, ...pageMeta(total, page, pageSize) };
  },
  async findBySlug(slug: string) {
    const project = await ProjectModel.findOne({ slug, ...publicFilter() }).lean();
    if (!project) return null;
    const [previous, next] = await Promise.all([
      ProjectModel.findOne({ ...publicFilter(), orderIndex: { $lt: project.orderIndex } }).sort({ orderIndex: -1 }).select("slug title").lean(),
      ProjectModel.findOne({ ...publicFilter(), orderIndex: { $gt: project.orderIndex } }).sort({ orderIndex: 1 }).select("slug title").lean(),
    ]);
    return {
      ...project,
      previousProject: previous ? { slug: previous.slug, title: previous.title } : null,
      nextProject: next ? { slug: next.slug, title: next.title } : null,
    };
  },
  related(slug: string, category: string, limit = 3) {
    return ProjectModel.find({ ...publicFilter(), slug: { $ne: slug }, category }).sort({ orderIndex: -1 }).limit(limit).select(listProjection).lean();
  },
  create(data: unknown) {
    return ProjectModel.create(data as Record<string, unknown>);
  },
  update(slug: string, data: unknown) {
    return ProjectModel.findOneAndUpdate({ slug }, data as Record<string, unknown>, { new: true });
  },
  delete(slug: string) {
    return ProjectModel.findOneAndDelete({ slug });
  },
  cmsList() {
    return ProjectModel.find().sort({ orderIndex: -1 }).lean();
  },
  async reorder(items: Array<{ slug: string; orderIndex: number }>) {
    await Promise.all(items.map((item) => ProjectModel.updateOne({ slug: item.slug }, { orderIndex: item.orderIndex })));
    return ProjectModel.find().sort({ orderIndex: 1 }).lean();
  },
};
