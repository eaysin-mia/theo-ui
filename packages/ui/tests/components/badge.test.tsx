import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "#components/badge";

describe("Badge component", () => {
  it("renders with default content", () => {
    render(<Badge>New Feature</Badge>);
    expect(screen.getByText("New Feature")).toBeInTheDocument();
  });

  it("applies variant styling classes", () => {
    const { container } = render(<Badge variant="secondary">Beta</Badge>);
    expect(container.firstChild).toHaveClass("bg-secondary");
  });

  it("applies size styling classes", () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    expect(container.firstChild).toHaveClass("h-6.5");
  });
});
