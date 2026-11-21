import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "#components/button";

describe("Button component", () => {
  it("renders with default properties and text", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("handles click events properly", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    const button = screen.getByRole("button", { name: /clickable/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects the disabled attribute and prevents clicks", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies variant styling classes", () => {
    const { container } = render(
      <Button variant="destructive">Destructive Action</Button>,
    );
    expect(container.firstChild).toHaveClass("bg-destructive");
  });

  it("renders loading indicator when loading is true", () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-loading", "");
    expect(
      button.querySelector("[data-slot='button-loading-indicator']"),
    ).toBeInTheDocument();
  });
});
