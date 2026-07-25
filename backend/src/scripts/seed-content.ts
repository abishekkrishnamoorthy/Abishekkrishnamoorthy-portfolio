import { connectDb, disconnectDb } from "@/config/db.js";
import { homeRepository } from "@/modules/home/home.repository.js";
import { skillsRepository } from "@/modules/skills/skills.repository.js";
import { contactRepository } from "@/modules/contact/contact.repository.js";
import { SettingsModel } from "@/modules/settings/settings.model.js";

async function main() {
  await connectDb();
  await Promise.all([
    homeRepository.getOrSeed(),
    skillsRepository.getOrSeed(),
    contactRepository.getOrSeed(),
    SettingsModel.findByIdAndUpdate("singleton", { $setOnInsert: { _id: "singleton", seo: {}, forms: {}, scheduling: {} } }, { upsert: true }),
  ]);
  await disconnectDb();
}

void main();
