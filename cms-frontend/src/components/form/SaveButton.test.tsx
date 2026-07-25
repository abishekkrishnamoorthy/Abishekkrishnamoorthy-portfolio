import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SaveButton } from "@/components/form/SaveButton";

describe("SaveButton", () => {
  it("shows and disables the saving state", () => {
    render(<SaveButton isSaving label="Save Project" />);
    const button = screen.getByRole("button", { name: "Saving..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows the configured idle label", () => {
    render(<SaveButton isSaving={false} label="Save Article" />);
    expect(screen.getByRole("button", { name: "Save Article" })).toBeEnabled();
  });
});
