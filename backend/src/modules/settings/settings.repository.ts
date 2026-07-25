import { SettingsModel } from "@/modules/settings/settings.model.js";

const defaultSettings = { _id: "singleton", seo: {}, forms: {}, scheduling: {} };

export const settingsRepository = {
  getOrSeed() {
    return SettingsModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultSettings }, { upsert: true, new: true }).lean();
  },
  update(data: unknown) {
    return SettingsModel.findByIdAndUpdate("singleton", data as Record<string, unknown>, { upsert: true, new: true }).lean();
  },
};
