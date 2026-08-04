import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BlogsListPage, { blogPublicUrl } from "@/pages/blogs/BlogsListPage";
import type { BlogArticle } from "@/types/blog.types";

const confirm = vi.fn();
const publishMutateAsync = vi.fn();
const deleteMutate = vi.fn();

const article: BlogArticle = {
  _id: "blog-1",
  slug: "deploying-nodejs-aws",
  title: "Deploying a Production-Ready Node.js Backend on AWS EC2",
  excerpt: "Learn how to deploy a production-ready Node.js backend on AWS EC2 using Nginx, PM2, HTTPS, and GitHub Actions.",
  category: "AWS",
  publishedAt: "2026-08-03",
  updatedAt: "2026-08-04",
  readTimeMinutes: 7,
  author: "Abishek Krishnamoorthy",
  tags: ["aws", "node"],
  coverImageUrl: "https://res.cloudinary.com/demo/image/upload/cover.webp",
  blocks: [],
  featured: true,
  publishStatus: "published",
};

vi.mock("@/app/providers/AuthProvider", () => ({
  useAuth: () => ({ user: { id: "1", name: "Admin", email: "admin@example.com", role: "SUPER_ADMIN" } }),
}));

vi.mock("@/hooks/useConfirm", () => ({
  useConfirm: () => confirm,
}));

vi.mock("@/hooks/useSaveWorkflow", () => ({
  useSaveWorkflow: () => ({ isSaving: false, save: (task: () => Promise<unknown>) => task(), validationFailed: vi.fn(), validationError: vi.fn() }),
}));

vi.mock("@/features/shared/hooks", () => ({
  useBlogs: () => ({ data: [article], isLoading: false }),
  useGlobalSeo: () => ({ data: { siteUrl: "https://abishek.example" } }),
  usePublishBlog: () => ({ mutateAsync: publishMutateAsync }),
  useDeleteBlog: () => ({ mutate: deleteMutate }),
}));

describe("BlogsListPage", () => {
  it("builds public article URLs from the CMS site URL", () => {
    expect(blogPublicUrl("https://abishek.example/", "hello world")).toBe("https://abishek.example/blog/hello%20world");
    expect(blogPublicUrl(undefined, "hello")).toBeUndefined();
  });

  it("renders premium blog cards with media, metadata, and authorized actions", () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <BlogsListPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Blogs" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `${article.title} cover` })).toHaveAttribute("loading", "lazy");
    expect(screen.getByText(article.title)).toBeInTheDocument();
    expect(screen.getByText(article.excerpt)).toBeInTheDocument();
    expect(screen.getAllByText("AWS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("7 min read")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute("href", `/blogs/${article.slug}`);
    expect(screen.getByRole("link", { name: /public/i })).toHaveAttribute("href", `https://abishek.example/blog/${article.slug}`);
    expect(screen.getByRole("button", { name: /unpublish/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });
});
