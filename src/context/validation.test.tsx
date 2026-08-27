import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { WizardProvider, useWizardContext } from "./WizardContext";
import type { IStepConfig, IValidatorAdapter } from "../types";

const adapterFor = (field: string): IValidatorAdapter<any> => ({
  validate: (data: any) =>
    data?.[field]
      ? { isValid: true }
      : { isValid: false, errors: { [field]: `${field} is required` } },
});

describe("onChange validation debounce", () => {
  it("does not cancel a pending validation when another step is edited", async () => {
    const steps: IStepConfig<any, any>[] = [
      {
        id: "one",
        label: "One",
        validationMode: "onChange",
        validationAdapter: adapterFor("a"),
      },
      {
        id: "two",
        label: "Two",
        validationMode: "onChange",
        validationAdapter: adapterFor("b"),
      },
    ];

    // Long enough that navigating back does not let step "two" fire on its own.
    const config = { steps, validationDebounceTime: 600 };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{ a: "ok", b: "ok" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));

    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("two"));

    // Queue a validation for step "two"...
    act(() => {
      result.current.setData("b", "");
    });

    // ...then go back (backward navigation does not validate) and edit step
    // "one" while step "two"'s validation is still pending.
    act(() => {
      result.current.goToPrevStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));
    act(() => {
      result.current.setData("a", "");
    });

    // Both debounced validations must land; a single shared timer drops the
    // one queued for step "two".
    await waitFor(
      () => {
        expect(result.current.allErrors.one?.a).toBeTruthy();
        expect(result.current.allErrors.two?.b).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });
});

describe("VALIDATE_END action payload", () => {
  it("reports the real validation result to middleware", async () => {
    const seen: any[] = [];
    const spy: any = (_api: any) => (next: any) => (action: any) => {
      seen.push(action);
      return next(action);
    };

    const steps: IStepConfig<any, any>[] = [
      {
        id: "one",
        label: "One",
        validationAdapter: adapterFor("a"),
      },
    ];

    const config = { steps, middlewares: [spy] };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{ a: "" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));

    await act(async () => {
      await result.current.validateStep("one");
    });

    const ends = seen.filter((a) => a.type === "VALIDATE_END");
    expect(ends).toHaveLength(1);
    expect(ends[0].payload.result.isValid).toBe(false);
    expect(ends[0].payload.result.errors).toEqual({ a: "a is required" });

    // The store must still hold the errors.
    expect(result.current.allErrors.one?.a).toBe("a is required");
  });

  it("reports success and clears errors", async () => {
    const seen: any[] = [];
    const spy: any = (_api: any) => (next: any) => (action: any) => {
      seen.push(action);
      return next(action);
    };

    const steps: IStepConfig<any, any>[] = [
      { id: "one", label: "One", validationAdapter: adapterFor("a") },
    ];
    const config = { steps, middlewares: [spy] };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{ a: "" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));

    await act(async () => {
      await result.current.validateStep("one");
    });
    expect(result.current.allErrors.one?.a).toBeTruthy();

    act(() => {
      result.current.setData("a", "filled");
    });
    await act(async () => {
      await result.current.validateStep("one");
    });

    const ends = seen.filter((a) => a.type === "VALIDATE_END");
    expect(ends[ends.length - 1].payload.result.isValid).toBe(true);
    expect(result.current.allErrors.one?.a).toBeUndefined();
  });
});

describe("setData edge paths", () => {
  const build = (steps: IStepConfig<any, any>[], extra: any = {}) => {
    const config = { steps, ...extra };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{}}>
        {children}
      </WizardProvider>
    );
    return renderHook(() => useWizardContext<any>(), { wrapper });
  };

  it("is a no-op when the value is unchanged", async () => {
    const seen: string[] = [];
    const spy: any = (_a: any) => (next: any) => (action: any) => {
      seen.push(action.type);
      return next(action);
    };
    const { result } = build([{ id: "one", label: "One" }], {
      middlewares: [spy],
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));

    act(() => {
      result.current.setData("a", 1);
    });
    const after = seen.filter((t) => t === "SET_DATA").length;

    act(() => {
      result.current.setData("a", 1);
    });
    expect(seen.filter((t) => t === "SET_DATA")).toHaveLength(after);
  });

  it("invalidates a dependent step that declares no clearData", async () => {
    const { result } = build([
      { id: "one", label: "One" },
      { id: "two", label: "Two", dependsOn: ["a"] },
      { id: "three", label: "Three" },
    ]);
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));

    await act(async () => {
      await result.current.goToNextStep();
    });
    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("three"));
    expect(result.current.completedSteps.has("two")).toBe(true);

    act(() => {
      result.current.setData("a", "changed");
    });

    await waitFor(() => {
      expect(result.current.completedSteps.has("two")).toBe(false);
      expect(result.current.visitedSteps.has("two")).toBe(false);
    });
    // No clearData means the data itself is untouched.
    expect(result.current.getData("a")).toBe("changed");
  });

  it("collapses rapid edits on the same step into one validation", async () => {
    let runs = 0;
    const steps: IStepConfig<any, any>[] = [
      {
        id: "one",
        label: "One",
        validationMode: "onChange",
        validationAdapter: {
          validate: () => {
            runs++;
            return { isValid: true };
          },
        },
      },
    ];
    const { result } = build(steps, { validationDebounceTime: 80 });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));
    runs = 0;

    act(() => {
      result.current.setData("a", "1");
      result.current.setData("a", "12");
      result.current.setData("a", "123");
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(runs).toBe(1);
  });

  it("persists on every change in onChange persistence mode", async () => {
    const saved: Record<string, any> = {};
    const adapter = {
      saveStep: <V,>(id: string, d: V) => {
        saved[id] = d;
      },
      getStep: <V,>(id: string): V | undefined => saved[id] as V,
      clear: () => {
        for (const k of Object.keys(saved)) delete saved[k];
      },
    };
    const { result } = build([{ id: "one", label: "One" }], {
      persistence: { adapter, mode: "onChange" as const },
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("one"));

    act(() => {
      result.current.setData("a", "written");
    });

    await waitFor(() => expect(saved.one).toEqual({ a: "written" }));
  });
});
