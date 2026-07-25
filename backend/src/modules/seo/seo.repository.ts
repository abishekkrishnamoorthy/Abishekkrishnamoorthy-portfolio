import { SeoOverrideModel } from "@/modules/seo/seo.model.js";

export const seoRepository = {
  list() {
    return SeoOverrideModel.find().lean();
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
