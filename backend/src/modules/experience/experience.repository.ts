import { ExperienceModel } from "@/modules/experience/experience.model.js";

export const experienceRepository = {
  list() {
    return ExperienceModel.find().sort({ orderIndex: 1 }).lean();
  },
  create(data: unknown) {
    return ExperienceModel.create(data as Record<string, unknown>);
  },
  update(id: string, data: unknown) {
    return ExperienceModel.findByIdAndUpdate(id, data as Record<string, unknown>, { new: true });
  },
  delete(id: string) {
    return ExperienceModel.findByIdAndDelete(id);
  },
  async reorder(items: Array<{ id: string; orderIndex: number }>) {
    await Promise.all(items.map((item) => ExperienceModel.findByIdAndUpdate(item.id, { orderIndex: item.orderIndex })));
    return ExperienceModel.find().sort({ orderIndex: 1 }).lean();
  },
};
