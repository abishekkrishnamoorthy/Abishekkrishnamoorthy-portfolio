import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { BlogArticleBuilder } from "@/features/blog-article-builder/BlogArticleBuilder";
import type { ArticleBlock } from "@/types/blog.types";

vi.mock("@/app/providers/ToastProvider", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

function BuilderHarness() {
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  return <BlogArticleBuilder blocks={blocks} onChange={setBlocks} onUpload={vi.fn()} />;
}

describe("BlogArticleBuilder points block", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("creates, edits, reorders, and removes points", () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Points" }));

    expect(screen.getByDisplayValue("First point")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Second point")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("First point"), { target: { value: "Updated first point" } });
    expect(screen.getByDisplayValue("Updated first point")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add point/i }));
    expect(screen.getByDisplayValue("New point")).toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText("Move point up")[2]);
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes[1]).toHaveValue("New point");

    fireEvent.click(screen.getAllByLabelText("Remove point")[1]);
    expect(screen.queryByDisplayValue("New point")).not.toBeInTheDocument();
  });
});
