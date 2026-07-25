import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "@/components/table/DataTable";

describe("DataTable", () => {
  it("renders rows through configured columns", () => {
    render(<DataTable rows={[{ id: "1", title: "QConnect", status: "published" }]} columns={[{ key: "title", header: "Title", primary: true, render: (row) => row.title }, { key: "status", header: "Status", render: (row) => row.status }]} />);
    expect(screen.getByText("QConnect")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
  });
});
