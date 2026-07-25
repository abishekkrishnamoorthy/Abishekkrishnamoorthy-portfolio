export type PublishStatus = "draft" | "published";
export type StatusResponse = { id?: string; status: string; message?: string };
export type NavItem = { slug: string; title: string } | null;
