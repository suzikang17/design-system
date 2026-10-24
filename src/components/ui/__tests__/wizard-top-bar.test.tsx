import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardTopBar } from "../wizard-top-bar";
const PHASES = [
  { label: "About You", stepCount: 5 },
  { label: "Work", stepCount: 4 },
  { label: "Background", stepCount: 3 },
  { label: "Finish Up", stepCount: 3 },
];
const TOTAL_WIZARD_STEPS = PHASES.reduce((sum, p) => sum + p.stepCount, 0);

describe("WizardTopBar phase stepper", () => {
  it("renders all 4 phase labels as aria-labels on progress segments", () => {
    render(
      <WizardTopBar
        currentStep={0}
        totalSteps={TOTAL_WIZARD_STEPS}
        onBack={vi.fn()}
        phases={PHASES}
        currentPhase={0}
        currentStepInPhase={0}
      />
    );
    expect(screen.getByLabelText(/About You/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Background/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Finish Up/)).toBeInTheDocument();
  });

  it("shows global step count on desktop", () => {
    const steps = Array.from({ length: TOTAL_WIZARD_STEPS }, (_, i) => ({
      id: `step-${i}`,
      title: `Step ${i + 1}`,
    }));
    render(
      <WizardTopBar
        currentStep={5}
        totalSteps={TOTAL_WIZARD_STEPS}
        onBack={vi.fn()}
        phases={PHASES}
        currentPhase={1}
        currentStepInPhase={1}
        steps={steps}
      />
    );
    expect(screen.getByText(new RegExp(`Step 6 of ${TOTAL_WIZARD_STEPS}`))).toBeInTheDocument();
  });

  it("marks earlier phases as done", () => {
    render(
      <WizardTopBar
        currentStep={5}
        totalSteps={TOTAL_WIZARD_STEPS}
        onBack={vi.fn()}
        phases={PHASES}
        currentPhase={1}
        currentStepInPhase={0}
      />
    );
    expect(screen.getByLabelText("About You — complete")).toBeInTheDocument();
  });

  it("falls back to pill bar when phases is empty array", () => {
    render(
      <WizardTopBar
        currentStep={0}
        totalSteps={3}
        onBack={vi.fn()}
        phases={[]}
        currentPhase={0}
        currentStepInPhase={0}
        steps={[{ id: "a", title: "Step A" }, { id: "b", title: "Step B" }, { id: "c", title: "Step C" }]}
      />
    );
    // Phase labels should NOT be present
    expect(screen.queryByText("About You")).not.toBeInTheDocument();
  });

  it("invokes onExit when 'Save & Exit' is confirmed (parent persists then navigates)", async () => {
    const onExit = vi.fn();
    const user = userEvent.setup();
    render(
      <WizardTopBar
        currentStep={1}
        totalSteps={5}
        onBack={vi.fn()}
        onExit={onExit}
        steps={[
          { id: "a", title: "Step A" },
          { id: "b", title: "Step B" },
        ]}
      />
    );

    // Opening the exit confirmation should not fire onExit yet.
    await user.click(screen.getAllByRole("button", { name: /Save & Exit/i })[0]);
    expect(onExit).not.toHaveBeenCalled();

    // Confirming triggers the parent's save-then-navigate handler exactly once.
    const buttons = screen.getAllByRole("button", { name: /Save & Exit/i });
    await user.click(buttons[buttons.length - 1]);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("does not render broken subtitle when currentPhase is out of bounds", () => {
    const steps = Array.from({ length: TOTAL_WIZARD_STEPS }, (_, i) => ({
      id: `step-${i}`,
      title: `Step ${i + 1}`,
    }));
    render(
      <WizardTopBar
        currentStep={TOTAL_WIZARD_STEPS - 1}
        totalSteps={TOTAL_WIZARD_STEPS}
        onBack={vi.fn()}
        phases={PHASES}
        currentPhase={PHASES.length} // out of bounds
        currentStepInPhase={0}
        steps={steps}
      />
    );
    // Should render "Step X of Y" with valid numbers, not "Step X of "
    const subtitle = screen.getByText(/Step \d+ of \d+/);
    expect(subtitle.textContent).not.toMatch(/of\s*$/); // no trailing "of " with no number
  });
});
