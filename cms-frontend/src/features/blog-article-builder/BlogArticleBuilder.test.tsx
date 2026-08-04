import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useState } from "react";
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

function RecordingBuilderHarness({ onBlocks }: { onBlocks: (blocks: ArticleBlock[]) => void }) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  useEffect(() => {
    onBlocks(blocks);
  }, [blocks, onBlocks]);
  return <BlogArticleBuilder blocks={blocks} onChange={setBlocks} onUpload={vi.fn()} />;
}

describe("BlogArticleBuilder points block", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  function paste(target: Element, text: string, html = "") {
    fireEvent.paste(target, {
      clipboardData: {
        getData: (type: string) => (type === "text/html" ? html : text),
        setData: vi.fn(),
      },
    });
  }

  it("creates points and supports keyboard-first editing", async () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Points" }));

    const firstPoint = screen.getByPlaceholderText("Point 1");
    expect(firstPoint).toHaveValue("");
    await waitFor(() => expect(firstPoint).toHaveFocus());

    fireEvent.change(firstPoint, { target: { value: "Alpha", selectionStart: 5, selectionEnd: 5 } });
    fireEvent.keyDown(firstPoint, { key: "Enter" });

    const points = screen.getAllByRole("textbox");
    expect(points[0]).toHaveValue("Alpha");
    expect(points[1]).toHaveValue("");
    await waitFor(() => expect(points[1]).toHaveFocus());

    fireEvent.change(points[1], { target: { value: "Beta" } });
    fireEvent.keyDown(points[1], { key: "ArrowUp" });
    await waitFor(() => expect(points[0]).toHaveFocus());
    fireEvent.keyDown(points[0], { key: "ArrowDown" });
    await waitFor(() => expect(points[1]).toHaveFocus());

    fireEvent.change(points[1], { target: { value: "" } });
    fireEvent.keyDown(points[1], { key: "Backspace" });

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.getByDisplayValue("Alpha")).toBeInTheDocument();
  });

  it("splits pasted lists into clean point items", () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Points" }));
    paste(screen.getByPlaceholderText("Point 1"), "- First\n• Second\n1. Third");

    expect(screen.getByDisplayValue("First")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Second")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Third")).toBeInTheDocument();
  });

  it("limits pasted points to the existing validation maximum", () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Points" }));
    paste(screen.getByPlaceholderText("Point 1"), Array.from({ length: 25 }, (_, index) => `- Item ${index + 1}`).join("\n"));

    expect(screen.getAllByRole("textbox")).toHaveLength(20);
    expect(screen.queryByDisplayValue("Item 21")).not.toBeInTheDocument();
  });

  it("defaults points to bullet style and supports changing marker style", async () => {
    let latestBlocks: ArticleBlock[] = [];
    render(<RecordingBuilderHarness onBlocks={(blocks) => { latestBlocks = blocks; }} />);

    fireEvent.click(screen.getByRole("button", { name: "Points" }));

    await waitFor(() => expect(latestBlocks[0]).toMatchObject({ type: "points", style: "bullet" }));
    expect(screen.getByRole("button", { name: "Bullet" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Letters" }));

    await waitFor(() => expect(latestBlocks[0]).toMatchObject({ type: "points", style: "letter" }));
    expect(screen.getByRole("button", { name: "Letters" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("BlogArticleBuilder table block", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  function paste(target: Element, text: string, html = "") {
    fireEvent.paste(target, {
      clipboardData: {
        getData: (type: string) => (type === "text/html" ? html : text),
        setData: vi.fn(),
      },
    });
  }

  it("supports spreadsheet-style keyboard navigation", async () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Table" }));

    const firstCell = screen.getByLabelText("Cell 1, 1");
    const secondCell = screen.getByLabelText("Cell 1, 2");
    firstCell.focus();

    fireEvent.keyDown(firstCell, { key: "Tab" });
    await waitFor(() => expect(secondCell).toHaveFocus());

    fireEvent.keyDown(secondCell, { key: "Tab", shiftKey: true });
    await waitFor(() => expect(firstCell).toHaveFocus());

    fireEvent.keyDown(firstCell, { key: "Enter" });
    const nextRowCell = await screen.findByLabelText("Cell 2, 1");
    await waitFor(() => expect(nextRowCell).toHaveFocus());
  });

  it("pastes markdown tables with headers", () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    paste(screen.getByLabelText("Cell 1, 1"), "| Name | Role |\n| --- | --- |\n| Ada | Engineer |\n| Grace | Admiral |");

    expect(screen.getByLabelText("Column 1")).toHaveValue("Name");
    expect(screen.getByLabelText("Column 2")).toHaveValue("Role");
    expect(screen.getByLabelText("Cell 1, 1")).toHaveValue("Ada");
    expect(screen.getByLabelText("Cell 2, 2")).toHaveValue("Admiral");
  });

  it("pastes TSV data and copies tab-separated table text", () => {
    render(<BuilderHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    paste(screen.getByLabelText("Cell 1, 1"), "Name\tRole\nAda\tEngineer");

    expect(screen.getByLabelText("Cell 1, 1")).toHaveValue("Name");
    expect(screen.getByLabelText("Cell 2, 2")).toHaveValue("Engineer");

    const setData = vi.fn();
    fireEvent.copy(screen.getByLabelText("Cell 1, 1"), {
      clipboardData: {
        setData,
      },
    });

    expect(setData).toHaveBeenCalledWith("text/plain", "Column 1\tColumn 2\nName\tRole\nAda\tEngineer");
  });
});
