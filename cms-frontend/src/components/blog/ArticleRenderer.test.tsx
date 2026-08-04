import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";

describe("CMS ArticleRenderer", () => {
  it("renders points marker styles with bullet as the legacy fallback", () => {
    render(<ArticleRenderer blocks={[
      { id: "legacy", type: "points", items: ["Legacy point"] },
      { id: "letter", type: "points", style: "letter", items: ["Letter point"] },
      { id: "number", type: "points", style: "number", items: ["Number point"] },
    ]} />);

    expect(screen.getByText("•")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders themed table and quote blocks", () => {
    const { container } = render(<ArticleRenderer blocks={[
      { id: "quote", type: "quote", text: "A polished quote should match the frontend article theme.", author: "Author" },
      { id: "table", type: "table", columns: ["Feature", "Status"], rows: [["Points", "Ready"]] },
    ]} />);

    expect(container.querySelector("blockquote")).toHaveClass("bg-[#121318]");
    expect(screen.getByRole("columnheader", { name: "Feature" })).toHaveClass("text-[#D4AF37]");
  });
});
