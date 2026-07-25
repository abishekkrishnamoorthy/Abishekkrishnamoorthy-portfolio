import type { Permission } from "@/lib/auth/permissions";

export type DashboardSummary = { projects: number; articles: number; unreadMessages: number; pendingMeetingRequests: number };
export type Experience = { _id: string; role: string; company: string; location: string; startDate: string; endDate?: string | null; description: string; techTags: string[]; orderIndex: number; publishStatus: "draft" | "published" };
export type AboutContent = { _id?: string; bio: unknown[]; profileImage?: { url: string; alt: string }; resumeUrl?: string; highlights: string[] };
export type Settings = { _id?: string; seo: Record<string, unknown>; forms: Record<string, unknown>; scheduling: Record<string, unknown> };
export type SeoOverride = { _id: string; pagePath: string; metaTitle: string; metaDescription: string; ogImageUrl?: string; canonicalUrl?: string };
export type CmsUser = { _id: string; id?: string; name: string; email: string; roleId?: { _id: string; name: string; permissions: Permission[] }; active: boolean };
export type Role = { _id: string; name: "SUPER_ADMIN" | "EDITOR" | "VIEWER"; permissions: Permission[] };
export type AuditLog = { _id: string; actor?: string; action: string; collection: string; documentId?: string; diff?: unknown; createdAt: string };
