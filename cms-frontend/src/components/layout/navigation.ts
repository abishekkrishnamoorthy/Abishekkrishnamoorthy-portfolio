import {
  Activity,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Contact,
  FileText,
  Home,
  Image,
  KeyRound,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

export const navGroups = [
  {
    label: "Content",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: BarChart3, module: "dashboard" },
      { label: "Home", path: "/home", icon: Home, module: "home" },
      { label: "Skills", path: "/skills", icon: Sparkles, module: "skills" },
      { label: "Projects", path: "/projects", icon: BriefcaseBusiness, module: "projects" },
      { label: "Blogs", path: "/blogs", icon: BookOpen, module: "blogs" },
      { label: "Experience", path: "/experience", icon: FileText, module: "experience" },
      { label: "About", path: "/about", icon: Contact, module: "about" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Contact", path: "/contact", icon: Mail, module: "contact" },
      { label: "Messages", path: "/messages", icon: MessageSquare, module: "messages" },
      { label: "Meeting Requests", path: "/meeting-requests", icon: Contact, module: "meeting-requests" },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Media", path: "/media", icon: Image, module: "media" },
      { label: "SEO", path: "/seo", icon: Search, module: "seo" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Settings", path: "/settings", icon: Settings, module: "settings" },
      { label: "Users", path: "/users", icon: Users, module: "users" },
      { label: "Roles", path: "/roles", icon: KeyRound, module: "roles" },
      { label: "Audit Logs", path: "/audit-logs", icon: Activity, module: "settings" },
      { label: "Profile", path: "/profile", icon: UserCog, module: "profile" },
      { label: "Forbidden", path: "/403", icon: Shield, module: "profile" },
    ],
  },
];
