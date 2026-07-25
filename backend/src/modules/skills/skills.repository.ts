import { SkillsContentModel } from "@/modules/skills/skills.model.js";

export const defaultSkills = {
  _id: "singleton",
  categories: [
    { id: "frontend", title: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Accessibility"], orderIndex: 0 },
    { id: "backend", title: "Backend", items: ["Node.js", "Express", "REST APIs", "MongoDB", "PostgreSQL", "Authentication"], orderIndex: 1 },
    { id: "ai-tools-cloud", title: "AI / Tools / Cloud", items: ["RAG", "OpenAI", "AWS", "Docker", "CI/CD", "Cloudinary"], orderIndex: 2 },
  ],
  learningItems: [
    { id: "advanced-rag", label: "Advanced RAG", icon: "Sparkles", progressPercent: 78, orderIndex: 0 },
    { id: "aws-architecture", label: "AWS Architecture", icon: "Cloud", progressPercent: 68, orderIndex: 1 },
    { id: "system-design", label: "System Design", icon: "Network", progressPercent: 72, orderIndex: 2 },
  ],
};

export const skillsRepository = {
  async getOrSeed() {
    return SkillsContentModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultSkills }, { upsert: true, new: true }).lean();
  },
  update(data: Omit<typeof defaultSkills, "_id">) {
    return SkillsContentModel.findByIdAndUpdate("singleton", data, { upsert: true, new: true }).lean();
  },
};
