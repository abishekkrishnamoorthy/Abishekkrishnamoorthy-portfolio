import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImagePreview } from "@/components/media/ImagePreview";

describe("ImagePreview", () => {
  it("renders an empty fixed-ratio frame when no image is selected", () => {
    render(<ImagePreview alt="Cover" />);

    expect(screen.getByText("No image selected")).toHaveClass("aspect-[16/9]");
  });

  it("renders lazy-loaded images inside a fixed-ratio frame", () => {
    render(<ImagePreview src="https://res.cloudinary.com/demo/image/upload/sample.webp" alt="Cover" />);

    const image = screen.getByRole("img", { name: "Cover" });
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveClass("object-cover");
    expect(image.parentElement).toHaveClass("aspect-[16/9]");
  });
});
