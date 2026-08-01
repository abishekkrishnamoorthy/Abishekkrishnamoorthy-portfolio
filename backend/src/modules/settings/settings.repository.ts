import { SettingsModel } from "@/modules/settings/settings.model.js";
import { DEFAULT_GLOBAL_SEO } from "@/modules/settings/settings.defaults.js";

const defaultSettings = { _id: "singleton", seo: DEFAULT_GLOBAL_SEO, forms: {}, scheduling: {} };

export const settingsRepository = {
  getOrSeed() {
    return SettingsModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultSettings }, { upsert: true, new: true }).lean();
  },
  update(data: unknown) {
    return SettingsModel.findByIdAndUpdate("singleton", data as Record<string, unknown>, { upsert: true, new: true }).lean();
  },
};
