import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "@/components/common/ErrorState";

describe("ErrorState", () => {
  it("shows the normalized message and retries", () => {
    const retry = vi.fn();
    render(createElement(ErrorState, { message: "The API is unreachable.", onRetry: retry }));
    expect(screen.getByText("The API is unreachable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
