import type { ArticlePreview } from "@/types/blog.types";
import type { Project } from "@/types/project.types";
import type { SkillsPayload } from "@/types/skill.types";

export type HomeHero = {
  roleBadge: string;
  headline: string;
  highlightedHeadline: string;
  subheadline: string;
  cta: {
    primaryLabel: string;
    secondaryLabel: string;
  };
  status: {
    enabled: boolean;
    text: string;
  };
  socialLinks: {
    linkedIn: string;
    gitHub: string;
    email: string;
  };
};

export type HomePayload = {
  hero: HomeHero;
  featuredProjects: Project[];
  skills: SkillsPayload;
  latestArticles: ArticlePreview[];
};
