import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RainbowButton } from "#components/buttons/rainbow-button";

describe("RainbowButton Pattern", () => {
  it("renders with default label and children", () => {
    render(<RainbowButton>Get Started</RainbowButton>);
    const button = screen.getByRole("button", { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<RainbowButton onClick={handleClick}>Click Me</RainbowButton>);
    const button = screen.getByRole("button", { name: /click me/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables interaction when disabled prop is true", () => {
    const handleClick = vi.fn();
    render(
      <RainbowButton disabled onClick={handleClick}>
        Disabled
      </RainbowButton>,
    );
    const button = screen.getByRole("button", { name: /disabled/i });

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders loading indicator and disables button when loading is true", () => {
    render(<RainbowButton loading>Saving</RainbowButton>);
    const button = screen.getByRole("button", { name: /saving/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-loading", "");
    expect(button).toHaveAttribute("aria-disabled", "true");

    const spinner = button.querySelector(
      '[data-slot="button-loading-indicator"]',
    );
    expect(spinner).toBeInTheDocument();
  });

  it("renders with custom className and outline variant", () => {
    render(
      <RainbowButton variant="outline" className="custom-rainbow">
        Outline Rainbow
      </RainbowButton>,
    );
    const button = screen.getByRole("button", { name: /outline rainbow/i });

    expect(button).toHaveClass("custom-rainbow");
    expect(button).toBeInTheDocument();
  });

  it("renders custom element when using render prop", () => {
    render(
      <RainbowButton
        render={<a href="/pricing">Link Button</a>}
      />,
    );
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/pricing");
  });
});
