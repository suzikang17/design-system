/**
 * The pill control vocabulary.
 *
 * What is checked here is the scale itself — height, radius and the `md:`
 * step-down — because that is the thing that drifts, and jsdom applies no
 * stylesheet, so the class each control carries is the only evidence there is.
 */
import { describe, it, expect, vi } from "vitest";
import type { FormEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PILL_CONTROL_SHAPE, PillButton, PillIconButton } from "../pill";
import { PillInput } from "../pill-input";
import {
  SEGMENTED_CONTROL_ITEM,
  SegmentedControl,
  SegmentedControlItem,
} from "../segmented-control";
import { filterPillClass } from "../filter-pill";

describe("PillButton", () => {
  it("is round, and steps down to the pills' height on desktop", () => {
    render(<PillButton>New task</PillButton>);
    const button = screen.getByRole("button", { name: "New task" });
    expect(button).toHaveClass("rounded-full");
    expect(button).not.toHaveClass("rounded-md");
    // A thumb target on a phone, the pill row's own height above `md`.
    expect(button).toHaveClass("h-10");
    expect(button).toHaveClass("md:h-8");
    expect(button).toHaveClass("text-sm");
    expect(button).toHaveClass("md:text-xs");
  });

  it("sizes its icon from the button, where the descendant selector can win", () => {
    // `Button` sets `[&_svg]:size-4`, which outranks anything written on the
    // icon itself. The step-down therefore has to be on the button too.
    render(<PillButton>Today</PillButton>);
    expect(screen.getByRole("button", { name: "Today" })).toHaveClass("md:[&_svg]:size-3.5");
  });

  it("fills the default and outlines the rest", () => {
    render(
      <>
        <PillButton>Primary</PillButton>
        <PillButton variant="outline">Secondary</PillButton>
      </>,
    );
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass("border-input");
    expect(screen.getByRole("button", { name: "Secondary" })).not.toHaveClass("bg-primary");
  });

  it("draws `dashed` as a quiet outline", () => {
    // The way out of a filtered list: an outline, dashed, in muted text.
    render(
      <PillButton variant="dashed" onClick={() => undefined}>
        Reset
      </PillButton>,
    );
    const reset = screen.getByRole("button", { name: "Reset" });
    expect(reset).toHaveClass("border-input");
    expect(reset).toHaveClass("border-dashed");
    expect(reset).toHaveClass("text-muted-foreground");
  });

  it("never submits a form it happens to be inside", async () => {
    // Every pill button is an action. A button with no type submits.
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PillButton onClick={() => undefined}>New task</PillButton>
        <PillIconButton aria-label="Export" onClick={() => undefined} />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "New task" }));
    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("still lets a form's own submit button submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PillButton type="submit">Save</PillButton>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("lets a screen override the shape it is given", () => {
    // The escape hatch every primitive in `ui/` offers: `className` merges last.
    render(<PillButton className="min-w-[140px] font-medium">Aug 10 – Aug 16</PillButton>);
    expect(screen.getByRole("button", { name: "Aug 10 – Aug 16" })).toHaveClass(
      "min-w-[140px]",
      "font-medium",
    );
  });
});

describe("PillIconButton", () => {
  it("is square at both sizes and round at both", () => {
    render(<PillIconButton aria-label="Next week" />);
    const button = screen.getByRole("button", { name: "Next week" });
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveClass("h-10", "w-10");
    expect(button).toHaveClass("md:h-8", "md:w-8");
  });

  it("is outlined unless it is told otherwise", () => {
    render(<PillIconButton aria-label="Export to CSV" />);
    expect(screen.getByRole("button", { name: "Export to CSV" })).toHaveClass(
      "border-input",
    );
  });
});

describe("SegmentedControl", () => {
  const render3 = (value: string, onValueChange = vi.fn()) => {
    render(
      <SegmentedControl value={value} onValueChange={onValueChange}>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="activity">Activity</SegmentedControlItem>
      </SegmentedControl>,
    );
    return onValueChange;
  };

  it("fills the selected option and leaves the rest as ghosts", () => {
    render3("day");
    // Same shape, told apart by fill — the rule the whole vocabulary runs on.
    expect(screen.getByRole("button", { name: "Day" })).toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: "Week" })).not.toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: "Activity" })).not.toHaveClass("bg-primary");
  });

  it("sits one step below the row, so the track lands back on it", () => {
    render3("week");
    for (const name of ["Week", "Day", "Activity"]) {
      expect(screen.getByRole("button", { name })).toHaveClass("h-9");
      expect(screen.getByRole("button", { name })).toHaveClass("md:h-7");
      expect(screen.getByRole("button", { name })).toHaveClass("rounded-full");
    }
  });

  it("keeps that step exactly the height of the track's own padding", () => {
    // The two heights are not a pair to be maintained by eye. `p-0.5` is 2px a
    // side, so the segment plus 4px has to BE the row's height at each width —
    // otherwise the control stops landing on the row it sits in, which is the
    // drift these primitives exist to stop.
    const PX: Record<string, number> = { "h-7": 28, "h-8": 32, "h-9": 36, "h-10": 40 };
    const TRACK_PADDING = 4;

    const height = (classes: string, prefix: string) => {
      const token = classes
        .split(/\s+/)
        .find((cls) => cls.startsWith(`${prefix}h-`));
      expect(token, `no ${prefix}height in "${classes}"`).toBeDefined();
      const px = PX[token!.slice(prefix.length)];
      expect(px, `unmapped height ${token}`).toBeDefined();
      return px;
    };

    for (const prefix of ["", "md:"]) {
      expect(height(SEGMENTED_CONTROL_ITEM, prefix) + TRACK_PADDING).toBe(
        height(PILL_CONTROL_SHAPE, prefix),
      );
    }
  });

  it("says which option is on, and not only by filling it", () => {
    // The fill is invisible to a screen reader: without this it hears three
    // buttons with nothing to tell them apart.
    render3("day");
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports the option that was pressed", async () => {
    const user = userEvent.setup();
    const onValueChange = render3("week");
    await user.click(screen.getByRole("button", { name: "Activity" }));
    expect(onValueChange).toHaveBeenCalledWith("activity");
  });

  it("never submits a form it happens to be inside", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SegmentedControl value="week" onValueChange={() => undefined}>
          <SegmentedControlItem value="day">Day</SegmentedControlItem>
        </SegmentedControl>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Day" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("PillInput", () => {
  it("wears the same fill and shape as an unset filter pill", () => {
    render(<PillInput aria-label="Search" value="" onChange={() => undefined} />);
    const box = screen.getByLabelText("Search");
    expect(box).toHaveClass("rounded-full");
    expect(box).toHaveClass("bg-card");
    expect(box).toHaveClass("border-input");
    expect(box).toHaveClass("h-10");
    expect(box).toHaveClass("md:h-8");
  });

  it("offers a clear button only while there is something to clear", () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <PillInput aria-label="Search" value="" onChange={() => undefined} onClear={onClear} />,
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();

    rerender(
      <PillInput aria-label="Search" value="cook" onChange={() => undefined} onClear={onClear} />,
    );
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("clears through the callback rather than by emptying the box itself", async () => {
    // The field is controlled: the screen owns the term, and a debounce it has
    // in flight has to be cancelled by the same handler.
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <PillInput aria-label="Search" value="cook" onChange={() => undefined} onClear={onClear} />,
    );
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Search")).toHaveValue("cook");
  });
});

describe("filterPillClass", () => {
  it("tells a set filter from an unset one by fill, not by shape", () => {
    const unset = filterPillClass(false).split(/\s+/);
    const set = filterPillClass(true).split(/\s+/);
    for (const shape of [unset, set]) {
      expect(shape).toContain("h-8");
      expect(shape).toContain("rounded-full");
    }
    expect(unset).toContain("bg-card");
    expect(set).toContain("bg-primary/10");
  });
});
