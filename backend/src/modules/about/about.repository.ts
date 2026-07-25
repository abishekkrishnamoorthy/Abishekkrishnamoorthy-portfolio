import { AboutContentModel } from "@/modules/about/about.model.js";

const defaultAbout = { _id: "singleton", bio: [], highlights: [] };

export const aboutRepository = {
  getOrSeed() {
    return AboutContentModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultAbout }, { upsert: true, new: true }).lean();
  },
  update(data: unknown) {
    return AboutContentModel.findByIdAndUpdate("singleton", data as Record<string, unknown>, { upsert: true, new: true }).lean();
  },
};
