import { getHome } from "@/services/home.service";
import type { LearningItem, SkillsPayload } from "@/types/skill.types";

export async function getSkills(): Promise<SkillsPayload> {
  return (await getHome()).skills;
}

export async function getCurrentlyLearning(): Promise<LearningItem[]> {
  return (await getSkills()).learningItems;
}
