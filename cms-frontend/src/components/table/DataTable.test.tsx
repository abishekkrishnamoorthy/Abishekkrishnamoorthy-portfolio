import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "@/components/table/DataTable";

describe("DataTable", () => {
  it("renders rows through configured columns", () => {
    render(<DataTable rows={[{ id: "1", title: "QConnect", status: "published" }]} columns={[{ key: "title", header: "Title", primary: true, render: (row) => row.title }, { key: "status", header: "Status", render: (row) => row.status }]} />);
    expect(screen.getByText("QConnect")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
  });

  it("keeps optional desktop actions in a sticky column", () => {
    render(<DataTable stickyActions rows={[{ id: "1", title: "QConnect" }]} columns={[{ key: "title", header: "Title", primary: true, render: (row) => row.title }]} actions={() => <button type="button">Edit</button>} />);
    expect(screen.getByRole("columnheader", { name: "Actions" })).toHaveClass("sticky", "right-0");
    expect(screen.getAllByRole("cell")[1]).toHaveClass("sticky", "right-0");
  });
});
