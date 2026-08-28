import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { WizardProvider, useWizardContext } from "./WizardContext";
import type { IStepConfig, IPersistenceAdapter } from "../types";

const makeAdapter = (seed: Record<string, any> = {}): IPersistenceAdapter & {
  store: Record<string, any>;
} => {
  const store: Record<string, any> = { ...seed };
  return {
    store,
    saveStep: <V,>(id: string, d: V) => {
      store[id] = d;
    },
    getStep: <V,>(id: string): V | undefined => store[id] as V,
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
};

const STEPS: IStepConfig<any, any>[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];

const mount = (config: any, initialData: any = {}) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WizardProvider config={config} initialData={initialData}>
      {children}
    </WizardProvider>
  );
  return renderHook(() => useWizardContext<any>(), { wrapper });
};

describe("isLoading", () => {
  it("clears after hydrating a persisted step", async () => {
    const adapter = makeAdapter({
      __wizzard_meta__: {
        currentStepId: "b",
        visited: ["a", "b"],
        completed: ["a"],
        history: ["a", "b"],
      },
    });
    const { result } = mount({ steps: STEPS, persistence: { adapter } });

    await waitFor(() => expect(result.current.currentStepId).toBe("b"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("clears on a fresh wizard too", async () => {
    const { result } = mount({ steps: STEPS });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

describe("reset", () => {
  it("uses the latest initialData, not the first render's", async () => {
    let bump: (v: any) => void = () => {};
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [data, setData] = useState<any>({ n: 1 });
      bump = setData;
      return (
        <WizardProvider config={{ steps: STEPS }} initialData={data}>
          {children}
        </WizardProvider>
      );
    };
    const { result } = renderHook(() => useWizardContext<any>(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    // The common async-defaults pattern: render with a placeholder, then feed
    // in fetched values.
    await act(async () => {
      bump({ n: 99 });
      await new Promise((r) => setTimeout(r, 300));
    });

    await act(async () => {
      result.current.reset();
      await new Promise((r) => setTimeout(r, 300));
    });

    expect(result.current.getData("n")).toBe(99);
  });

  it("cancels pending onChange validation so it cannot repopulate errors", async () => {
    const steps: IStepConfig<any, any>[] = [
      {
        id: "a",
        label: "A",
        validationMode: "onChange",
        validationAdapter: {
          validate: (data: any) =>
            data?.name
              ? { isValid: true }
              : { isValid: false, errors: { name: "required" } },
        },
      },
    ];
    const { result } = mount({ steps, validationDebounceTime: 200 });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    act(() => {
      result.current.setData("name", "");
    });
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });
    expect(result.current.allErrors.a).toBeUndefined();
  });
});

describe("updateConfig", () => {
  it("survives a parent re-render with an inline config literal", async () => {
    let bump: () => void = () => {};
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [, setN] = useState(0);
      bump = () => setN((x) => x + 1);
      return (
        <WizardProvider config={{ steps: STEPS }} initialData={{}}>
          {children}
        </WizardProvider>
      );
    };
    const { result } = renderHook(() => useWizardContext<any>(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    act(() => {
      result.current.updateConfig({ autoValidate: true });
    });
    await waitFor(() => expect(result.current.config.autoValidate).toBe(true));

    await act(async () => {
      bump();
      await new Promise((r) => setTimeout(r, 300));
    });

    expect(result.current.config.autoValidate).toBe(true);
  });
});

describe("dependsOn matching", () => {
  it("invalidates when a parent object of the dependency is replaced", async () => {
    const steps: IStepConfig<any, any>[] = [
      { id: "a", label: "A" },
      {
        id: "b",
        label: "B",
        dependsOn: ["user.country"],
        clearData: ["shipping"],
      },
      { id: "c", label: "C" },
    ];
    const { result } = mount(
      { steps },
      { user: { country: "US" }, shipping: "stale" }
    );
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    // Replacing the whole parent object must count as changing its children.
    act(() => {
      result.current.setData("user", { country: "FR" });
    });

    await waitFor(() =>
      expect(result.current.getData("shipping")).toBeUndefined()
    );
  });
});

describe("persisted navigation meta", () => {
  it("records dependsOn invalidation so a reload does not restore it", async () => {
    const adapter = makeAdapter();
    const steps: IStepConfig<any, any>[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B", dependsOn: ["flag"], clearData: ["derived"] },
      { id: "c", label: "C" },
    ];
    const { result } = mount(
      { steps, persistence: { adapter } },
      { derived: "x" }
    );
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    await act(async () => {
      await result.current.goToNextStep();
    });
    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("c"));

    act(() => {
      result.current.setData("flag", true);
    });
    await waitFor(() =>
      expect(result.current.completedSteps.has("b")).toBe(false)
    );

    const meta = adapter.store.__wizzard_meta__;
    expect(meta.completed).not.toContain("b");
    expect(meta.visited).not.toContain("b");
  });

  it("records a step as completed as soon as it is passed", async () => {
    const adapter = makeAdapter();
    const { result } = mount({ steps: STEPS, persistence: { adapter } });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("b"));

    expect(adapter.store.__wizzard_meta__.completed).toContain("a");
  });
});

describe("stale async validation", () => {
  it("does not resurrect an error the user just cleared", async () => {
    let release: (v: any) => void = () => {};
    const steps: IStepConfig<any, any>[] = [
      {
        id: "a",
        label: "A",
        validationAdapter: {
          validate: () =>
            new Promise((res) => {
              release = () => res({ isValid: false, errors: { name: "stale" } });
            }),
        },
      },
    ];
    const { result } = mount({ steps });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    let pending: Promise<any>;
    act(() => {
      pending = result.current.validateStep("a");
    });

    // User fixes the field while validation is still in flight.
    act(() => {
      result.current.setData("name", "fixed");
    });

    await act(async () => {
      release(null);
      await pending!;
    });

    expect(result.current.allErrors.a?.name).toBeUndefined();
  });
});
