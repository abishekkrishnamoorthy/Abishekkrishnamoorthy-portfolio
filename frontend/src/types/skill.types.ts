export type SkillCategory = {
  category: "frontend" | "backend" | "ai-tools-cloud";
  title: string;
  items: string[];
};

export type LearningItem = {
  label: string;
  icon: string;
  progressPercent: number;
};

export type SkillsPayload = {
  categories: SkillCategory[];
  learningItems: LearningItem[];
};
