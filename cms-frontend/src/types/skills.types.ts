export type SkillCategory = { id: "frontend" | "backend" | "ai-tools-cloud"; title: string; items: string[]; orderIndex: number };
export type LearningItem = { id: string; label: string; icon: "Sparkles" | "Cloud" | "Network"; progressPercent: number; orderIndex: number };
export type SkillsContent = { _id?: string; categories: SkillCategory[]; learningItems: LearningItem[] };
