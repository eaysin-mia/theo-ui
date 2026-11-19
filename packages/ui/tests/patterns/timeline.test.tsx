import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "theo-ui/patterns/timeline";

describe("Timeline Pattern", () => {
  it("renders timeline items, titles, and dates correctly", () => {
    render(
      <Timeline defaultValue={2}>
        <TimelineItem step={1}>
          <TimelineIndicator />
          <TimelineSeparator />
          <TimelineHeader>
            <TimelineDate>2026-01-01</TimelineDate>
            <TimelineTitle>Step One</TimelineTitle>
          </TimelineHeader>
          <TimelineContent>Content for step one</TimelineContent>
        </TimelineItem>
        <TimelineItem step={2}>
          <TimelineIndicator />
          <TimelineHeader>
            <TimelineDate>2026-02-01</TimelineDate>
            <TimelineTitle>Step Two</TimelineTitle>
          </TimelineHeader>
          <TimelineContent>Content for step two</TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByText("Step One")).toBeInTheDocument();
    expect(screen.getByText("Content for step one")).toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();

    expect(screen.getByText("Step Two")).toBeInTheDocument();
    expect(screen.getByText("Content for step two")).toBeInTheDocument();
    expect(screen.getByText("2026-02-01")).toBeInTheDocument();
  });

  it("applies data-orientation and orientation styles", () => {
    const { rerender } = render(
      <Timeline orientation="vertical" data-testid="timeline">
        <TimelineItem step={1}>
          <TimelineTitle>Step</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    let timeline = screen.getByTestId("timeline");
    expect(timeline).toHaveAttribute("data-orientation", "vertical");

    rerender(
      <Timeline orientation="horizontal" data-testid="timeline">
        <TimelineItem step={1}>
          <TimelineTitle>Step</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    timeline = screen.getByTestId("timeline");
    expect(timeline).toHaveAttribute("data-orientation", "horizontal");
  });

  it("marks steps as data-completed when step <= activeStep", () => {
    render(
      <Timeline defaultValue={1}>
        <TimelineItem step={1} data-testid="item-1">
          <TimelineTitle>Step 1</TimelineTitle>
        </TimelineItem>
        <TimelineItem step={2} data-testid="item-2">
          <TimelineTitle>Step 2</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    const item1 = screen.getByTestId("item-1");
    const item2 = screen.getByTestId("item-2");

    expect(item1).toHaveAttribute("data-completed", "true");
    expect(item2).not.toHaveAttribute("data-completed");
  });

  it("supports controlled value prop", () => {
    const { rerender } = render(
      <Timeline value={2}>
        <TimelineItem step={1} data-testid="item-1">
          <TimelineTitle>Step 1</TimelineTitle>
        </TimelineItem>
        <TimelineItem step={2} data-testid="item-2">
          <TimelineTitle>Step 2</TimelineTitle>
        </TimelineItem>
        <TimelineItem step={3} data-testid="item-3">
          <TimelineTitle>Step 3</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("item-1")).toHaveAttribute(
      "data-completed",
      "true",
    );
    expect(screen.getByTestId("item-2")).toHaveAttribute(
      "data-completed",
      "true",
    );
    expect(screen.getByTestId("item-3")).not.toHaveAttribute("data-completed");

    rerender(
      <Timeline value={3}>
        <TimelineItem step={1} data-testid="item-1">
          <TimelineTitle>Step 1</TimelineTitle>
        </TimelineItem>
        <TimelineItem step={2} data-testid="item-2">
          <TimelineTitle>Step 2</TimelineTitle>
        </TimelineItem>
        <TimelineItem step={3} data-testid="item-3">
          <TimelineTitle>Step 3</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("item-3")).toHaveAttribute(
      "data-completed",
      "true",
    );
  });

  it("throws an error when TimelineItem is rendered outside Timeline context", () => {
    // Suppress console.error for expected react error boundary / thrown error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <TimelineItem step={1}>
          <TimelineTitle>Orphan Item</TimelineTitle>
        </TimelineItem>,
      ),
    ).toThrow("useTimeline must be used within a Timeline");

    spy.mockRestore();
  });
});
