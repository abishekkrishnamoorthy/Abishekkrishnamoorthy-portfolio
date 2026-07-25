export type ProjectStatus = "production" | "in-progress" | "completed";
export type ProjectCategory = "AI" | "Full Stack" | "Cloud" | "Frontend" | "Backend" | "Learning";
export type ProjectSort = "newest" | "oldest" | "az";

export type ProjectHeaderShowcaseImage = {
  imageUrl: string;
  label: string;
  order: 1 | 2 | 3 | 4 | 5;
};

export type ProjectHeader = {
  badge: string;
  title: string;
  highlightText: string;
  description: string;
  showcaseImages: ProjectHeaderShowcaseImage[];
};

export type Project = {
  id: string;
  slug: string;
  orderIndex: number;
  title: string;
  tagline: string;
  shortDescription: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  thumbnailUrl: string;
  techTags: string[];
  highlights: string[];
  liveDemoUrl: string;
  githubUrl: string;
  durationLabel: string;
  role: string;
  lastUpdatedAt: string;
  techIcons: string[];
  readmeMarkdown: string;
  projectStructure: string;
  techStackTable: { category: string; technologies: string }[];
  gallery: { url: string; caption?: string; alt?: string; title?: string; description?: string }[];
  architectureNotes: string;
  challenges: string[];
  solutions: string[];
  learningOutcomes: string[];
  architectureDiagramUrl?: string;
  previousProject?: { slug: string; title: string } | null;
  nextProject?: { slug: string; title: string } | null;
};

export type ProjectsQuery = {
  category?: "All" | ProjectCategory;
  search?: string;
  sort?: ProjectSort;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  limit?: number;
};

export type ProjectsPage = {
  items: Project[];
  nextPage?: number;
  hasNextPage: boolean;
  total?: number;
};
