import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; src: string }) => createElement("img", { alt, ...props }),
}));

describe("ArticleRenderer", () => {
  it("renders points blocks", () => {
    render(<ArticleRenderer blocks={[
      { id: "points-1", type: "points", items: ["First public point", "Second public point"] },
      { id: "points-2", type: "points", style: "letter", items: ["Letter public point"] },
      { id: "points-3", type: "points", style: "number", items: ["Number public point"] },
    ]} />);

    expect(screen.getByText("First public point")).toBeInTheDocument();
    expect(screen.getByText("Second public point")).toBeInTheDocument();
    expect(screen.getAllByText("•")).toHaveLength(2);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders themed quote and table blocks", () => {
    const { container } = render(<ArticleRenderer blocks={[
      { id: "quote", type: "quote", text: "A public quote should blend with the article theme.", author: "Author" },
      { id: "table", type: "table", columns: ["Feature", "Status"], rows: [["Points", "Ready"]] },
    ]} />);

    expect(container.querySelector("blockquote")).toHaveClass("border-[rgba(212,175,55,0.24)]");
    expect(screen.getByRole("columnheader", { name: "Feature" })).toHaveClass("text-[var(--accent-gold)]");
  });
});
