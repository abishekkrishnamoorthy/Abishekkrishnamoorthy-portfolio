import { SeoOverrideModel } from "@/modules/seo/seo.model.js";

export const seoRepository = {
  list() {
    return SeoOverrideModel.find().lean();
  },
  findByIdLean(id: string) {
    return SeoOverrideModel.findById(id).lean();
  },
  findByPagePathLean(pagePath: string) {
    return SeoOverrideModel.findOne({ pagePath }).lean();
  },
  listPublicIndexablePaths() {
    return SeoOverrideModel.find().select("pagePath robots updatedAt").lean();
  },
  create(data: unknown) {
    return SeoOverrideModel.create(data as Record<string, unknown>);
  },
  update(id: string, data: unknown) {
    return SeoOverrideModel.findByIdAndUpdate(id, data as Record<string, unknown>, { new: true });
  },
  delete(id: string) {
    return SeoOverrideModel.findByIdAndDelete(id);
  },
};
