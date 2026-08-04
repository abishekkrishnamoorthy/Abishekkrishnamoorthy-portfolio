import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; src: string }) => createElement("img", { alt, ...props }),
}));

describe("ArticleRenderer", () => {
  it("renders points blocks", () => {
    render(<ArticleRenderer blocks={[{ id: "points-1", type: "points", items: ["First public point", "Second public point"] }]} />);

    expect(screen.getByText("First public point")).toBeInTheDocument();
    expect(screen.getByText("Second public point")).toBeInTheDocument();
  });
});
