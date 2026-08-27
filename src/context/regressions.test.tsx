import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { WizardProvider, useWizardContext, useWizardActions } from "./WizardContext";
import type { IStepConfig, IPersistenceAdapter } from "../types";

const makeAdapter = (seed: Record<string, any> = {}): IPersistenceAdapter => {
  const store: Record<string, any> = { ...seed };
  return {
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

describe("hydration", () => {
  it("restores the persisted currentStepId instead of falling back to the first step", async () => {
    const adapter = makeAdapter({
      __wizzard_meta__: {
        currentStepId: "c",
        visited: ["a", "b", "c"],
        completed: ["a", "b"],
        history: ["a", "b", "c"],
      },
    });
    const config = { steps: STEPS, persistence: { adapter } };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{}}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });

    await waitFor(() => expect(result.current.currentStepId).toBe("c"));
    expect(result.current.history).toEqual(["a", "b", "c"]);
  });

  it("hydrates again when the persistence adapter is swapped at runtime", async () => {
    const first = makeAdapter({
      __wizzard_meta__: { currentStepId: "a", visited: ["a"], completed: [], history: ["a"] },
    });
    const second = makeAdapter({
      __wizzard_meta__: { currentStepId: "b", visited: ["a", "b"], completed: ["a"], history: ["a", "b"] },
    });

    let swap: () => void = () => {};
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [adapter, setAdapter] = useState(first);
      swap = () => setAdapter(() => second);
      return (
        <WizardProvider config={{ steps: STEPS, persistence: { adapter } }} initialData={{}}>
          {children}
        </WizardProvider>
      );
    };
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    await act(async () => {
      swap();
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(result.current.currentStepId).toBe("b");
  });
});

describe("validation adapter that throws", () => {
  it("keeps the previously reported errors", async () => {
    let mode: "invalid" | "throw" = "invalid";
    const steps: IStepConfig<any, any>[] = [
      {
        id: "a",
        label: "A",
        validationAdapter: {
          validate: () => {
            if (mode === "throw") throw new Error("boom");
            return { isValid: false, errors: { name: "required" } };
          },
        },
      },
    ];
    const config = { steps };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{}}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    await act(async () => {
      await result.current.validateStep("a");
    });
    expect(result.current.allErrors.a).toEqual({ name: "required" });

    mode = "throw";
    await act(async () => {
      await result.current.validateStep("a").catch(() => {});
    });

    // A crashing adapter must not silently wipe the messages the user sees.
    expect(result.current.allErrors.a).toEqual({ name: "required" });
  });
});

describe("clearData does not mangle non-JSON values", () => {
  it("preserves a Date elsewhere in the data", async () => {
    const when = new Date("2020-01-01T00:00:00.000Z");
    const steps: IStepConfig<any, any>[] = [
      { id: "a", label: "A" },
      {
        id: "b",
        label: "B",
        dependsOn: ["provider"],
        clearData: () => ({ instance: undefined }),
      },
    ];
    const config = { steps };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{ when, instance: "x" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    act(() => {
      result.current.setData("provider", "aws");
    });

    await waitFor(() => expect(result.current.getData("instance")).toBeUndefined());
    expect(result.current.getData("when")).toBeInstanceOf(Date);
  });
});

describe("actions identity", () => {
  it("stays stable across parent renders with an inline initialData literal", async () => {
    const seen: any[] = [];
    const Probe = () => {
      const actions = useWizardActions();
      if (seen[seen.length - 1] !== actions) seen.push(actions);
      return null;
    };

    let bump: () => void = () => {};
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [, setN] = useState(0);
      bump = () => setN((x) => x + 1);
      return (
        <WizardProvider config={{ steps: STEPS }} initialData={{}}>
          {children}
          <Probe />
        </WizardProvider>
      );
    };
    renderHook(() => useWizardContext<any>(), { wrapper: Wrapper });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });
    const before = seen.length;

    await act(async () => {
      bump();
      await new Promise((r) => setTimeout(r, 400));
    });

    expect(seen.length).toBe(before);
  });
});

describe("dependsOn with bracket paths", () => {
  it("matches array index paths under a declared dependency", async () => {
    const steps: IStepConfig<any, any>[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B", dependsOn: ["items"], clearData: ["summary"] },
      { id: "c", label: "C" },
    ];
    const config = { steps };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{ summary: "stale" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));

    act(() => {
      result.current.setData("items[0].name", "x");
    });

    await waitFor(() => expect(result.current.getData("summary")).toBeUndefined());
  });
});
