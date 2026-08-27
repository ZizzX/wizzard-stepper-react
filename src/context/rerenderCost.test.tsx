import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import { useState } from "react";
import { WizardProvider, useWizardState } from "./WizardContext";
import type { IStepConfig } from "../types";

let childRenders = 0;
const Child = () => {
  useWizardState();
  childRenders++;
  return null;
};

const settle = () =>
  act(async () => {
    // Longer than the 200ms condition-resolution debounce in WizardProvider.
    await new Promise((r) => setTimeout(r, 400));
  });

// Hoisted once, as the README recommends. Only the wrapping config object is
// re-created by the parent render.
const STEPS: IStepConfig<any, any>[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
];

describe("provider re-render cost", () => {
  it("costs one render per parent render when steps are stable", async () => {
    let bump: () => void = () => {};
    const Parent = () => {
      const [, setN] = useState(0);
      bump = () => setN((x) => x + 1);
      return (
        <WizardProvider config={{ steps: STEPS }} initialData={{}}>
          <Child />
        </WizardProvider>
      );
    };

    childRenders = 0;
    render(<Parent />);
    await settle();
    const afterMount = childRenders;

    await act(async () => {
      bump();
    });
    await settle();

    // An inline `config={{ steps }}` literal must not re-seed local config,
    // rebuild the step maps or re-run condition resolution.
    expect(childRenders - afterMount).toBe(1);
  });

  it("does not re-run INIT when initialData is an inline literal", async () => {
    const seen: string[] = [];
    const spy: any = (_api: any) => (next: any) => (action: any) => {
      seen.push(action.type);
      return next(action);
    };

    let bump: () => void = () => {};
    const Parent = () => {
      const [n, setN] = useState(0);
      bump = () => setN((x) => x + 1);
      return (
        <WizardProvider
          config={{ steps: STEPS, middlewares: [spy] }}
          initialData={{ n }}
        >
          <Child />
        </WizardProvider>
      );
    };

    render(<Parent />);
    await settle();

    await act(async () => {
      bump();
    });
    await settle();

    expect(seen.filter((t) => t === "INIT")).toHaveLength(1);
  });
});
