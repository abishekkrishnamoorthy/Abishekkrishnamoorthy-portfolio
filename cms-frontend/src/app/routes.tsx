import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { RequireAuth, RequirePermission } from "@/app/guards";
import { CommandPalette } from "@/components/ui/CommandPalette";

const LoginPage = lazy(() => import("@/pages/login/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const HomeEditorPage = lazy(() => import("@/pages/home-editor/HomeEditorPage"));
const SkillsEditorPage = lazy(() => import("@/pages/skills-editor/SkillsEditorPage"));
const ProjectsListPage = lazy(() => import("@/pages/projects/ProjectsListPage"));
const ProjectEditorPage = lazy(() => import("@/pages/projects/ProjectEditorPage"));
const BlogsListPage = lazy(() => import("@/pages/blogs/BlogsListPage"));
const BlogEditorPage = lazy(() => import("@/pages/blogs/BlogEditorPage"));
const ExperiencePage = lazy(() => import("@/pages/experience/ExperiencePage"));
const AboutEditorPage = lazy(() => import("@/pages/about-editor/AboutEditorPage"));
const ContactEditorPage = lazy(() => import("@/pages/contact-editor/ContactEditorPage"));
const MessagesPage = lazy(() => import("@/pages/messages/MessagesPage"));
const MeetingRequestsPage = lazy(() => import("@/pages/meeting-requests/MeetingRequestsPage"));
const MediaLibraryPage = lazy(() => import("@/pages/media-library/MediaLibraryPage"));
const SeoPage = lazy(() => import("@/pages/seo/SeoPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const RolesPage = lazy(() => import("@/pages/roles/RolesPage"));
const AuditLogsPage = lazy(() => import("@/pages/audit-logs/AuditLogsPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const Forbidden = lazy(() => import("@/pages/errors/Forbidden"));
const NotFound = lazy(() => import("@/pages/errors/NotFound"));
const ServerError = lazy(() => import("@/pages/errors/ServerError"));

function Shell() {
  return (
    <>
      <DashboardLayout />
      <CommandPalette />
    </>
  );
}

const protectedChild = (module: string, element: JSX.Element, action = "read") => ({
  element: <RequirePermission module={module} action={action} />,
  children: [{ index: true, element: <Suspense fallback={<div className="text-secondary">Loading...</div>}>{element}</Suspense> }],
});

const lazyElement = (element: JSX.Element) => <Suspense fallback={<div className="text-secondary">Loading...</div>}>{element}</Suspense>;
const withPermission = (module: string, action: string, element: ReactNode) => ({
  element: <RequirePermission module={module} action={action} />,
  children: [{ index: true, element: lazyElement(element as JSX.Element) }],
});

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: lazyElement(<LoginPage />) }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Shell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", ...protectedChild("dashboard", <DashboardPage />) },
          { path: "home", ...protectedChild("home", <HomeEditorPage />) },
          { path: "skills", ...protectedChild("skills", <SkillsEditorPage />) },
          {
            path: "projects",
            element: <RequirePermission module="projects" action="read" />,
            children: [
              {
                element: lazyElement(<ProjectsListPage />),
                children: [
                  { index: true, element: null },
                  { path: "new", ...withPermission("projects", "create", <ProjectEditorPage />) },
                  { path: ":slug", ...withPermission("projects", "update", <ProjectEditorPage />) },
                ],
              },
            ],
          },
          {
            path: "blogs",
            element: <RequirePermission module="blogs" action="read" />,
            children: [
              {
                element: lazyElement(<BlogsListPage />),
                children: [
                  { index: true, element: null },
                  { path: "new", ...withPermission("blogs", "create", <BlogEditorPage />) },
                  { path: ":slug", ...withPermission("blogs", "update", <BlogEditorPage />) },
                ],
              },
            ],
          },
          { path: "experience", ...protectedChild("experience", <ExperiencePage />) },
          { path: "about", ...protectedChild("about", <AboutEditorPage />) },
          { path: "contact", ...protectedChild("contact", <ContactEditorPage />) },
          { path: "messages", ...protectedChild("messages", <MessagesPage />) },
          { path: "meeting-requests", ...protectedChild("meeting-requests", <MeetingRequestsPage />) },
          { path: "media", ...protectedChild("media", <MediaLibraryPage />) },
          { path: "seo", ...protectedChild("seo", <SeoPage />) },
          { path: "settings", ...protectedChild("settings", <SettingsPage />) },
          { path: "users", ...protectedChild("users", <UsersPage />) },
          { path: "roles", ...protectedChild("roles", <RolesPage />) },
          { path: "audit-logs", ...protectedChild("settings", <AuditLogsPage />) },
          { path: "profile", ...protectedChild("profile", <ProfilePage />) },
          { path: "403", element: lazyElement(<Forbidden />) },
          { path: "500", element: lazyElement(<ServerError />) },
        ],
      },
    ],
  },
  { path: "*", element: lazyElement(<NotFound />) },
]);
