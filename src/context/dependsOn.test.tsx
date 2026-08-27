import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { WizardProvider, useWizardContext } from "./WizardContext";
import type { IStepConfig } from "../types";

type Data = {
  provider?: string;
  instance?: string;
  networking?: { advancedMode?: boolean; vpcId?: string; subnet?: string };
};

const renderWizard = (steps: IStepConfig<any, any>[]) => {
  const config = { steps };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WizardProvider config={config} initialData={{} as Data}>
      {children}
    </WizardProvider>
  );
  return renderHook(() => useWizardContext<Data>(), { wrapper });
};

describe("dependsOn / clearData", () => {
  it("clears dependent paths in the store when a dependency changes", async () => {
    const steps: IStepConfig<any, any>[] = [
      { id: "provider", label: "Provider" },
      {
        id: "instance",
        label: "Instance",
        dependsOn: ["provider"],
        clearData: ["instance"],
      },
    ];

    const { result } = renderWizard(steps);
    await waitFor(() => expect(result.current.currentStepId).toBe("provider"));

    act(() => {
      result.current.setData("provider", "aws");
      result.current.setData("instance", "t3.micro");
    });
    expect(result.current.getData("instance")).toBe("t3.micro");

    // Changing the dependency must wipe the dependent path in the STORE,
    // not just in a local copy used for validation/persistence.
    act(() => {
      result.current.setData("provider", "gcp");
    });

    await waitFor(() =>
      expect(result.current.getData("instance")).toBeUndefined()
    );
    expect(result.current.getData("provider")).toBe("gcp");
  });

  it("clears several dependent paths, including nested ones", async () => {
    const steps: IStepConfig<any, any>[] = [
      { id: "net", label: "Networking" },
      {
        id: "advanced",
        label: "Advanced",
        dependsOn: ["networking.advancedMode"],
        clearData: ["networking.vpcId", "networking.subnet"],
      },
    ];

    const { result } = renderWizard(steps);
    await waitFor(() => expect(result.current.currentStepId).toBe("net"));

    act(() => {
      result.current.setData("networking.advancedMode", true);
      result.current.setData("networking.vpcId", "vpc-1");
      result.current.setData("networking.subnet", "subnet-1");
    });
    expect(result.current.getData("networking.vpcId")).toBe("vpc-1");

    act(() => {
      result.current.setData("networking.advancedMode", false);
    });

    await waitFor(() => {
      expect(result.current.getData("networking.vpcId")).toBeUndefined();
      expect(result.current.getData("networking.subnet")).toBeUndefined();
    });
    expect(result.current.getData("networking.advancedMode")).toBe(false);
  });

  it("applies the functional form of clearData as a data patch", async () => {
    const steps: IStepConfig<any, any>[] = [
      { id: "provider", label: "Provider" },
      {
        id: "instance",
        label: "Instance",
        dependsOn: ["provider"],
        clearData: () => ({ instance: "default" }),
      },
    ];

    const { result } = renderWizard(steps);
    await waitFor(() => expect(result.current.currentStepId).toBe("provider"));

    act(() => {
      result.current.setData("instance", "t3.micro");
    });

    act(() => {
      result.current.setData("provider", "aws");
    });

    await waitFor(() =>
      expect(result.current.getData("instance")).toBe("default")
    );
  });

  it("drops the dependent step from visited and completed steps", async () => {
    const steps: IStepConfig<any, any>[] = [
      { id: "provider", label: "Provider" },
      {
        id: "instance",
        label: "Instance",
        dependsOn: ["provider"],
        clearData: ["instance"],
      },
      { id: "review", label: "Review" },
    ];

    const { result } = renderWizard(steps);
    await waitFor(() => expect(result.current.currentStepId).toBe("provider"));

    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("instance"));

    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("review"));
    expect(result.current.visitedSteps.has("instance")).toBe(true);
    expect(result.current.completedSteps.has("instance")).toBe(true);

    act(() => {
      result.current.setData("provider", "gcp");
    });

    await waitFor(() => {
      expect(result.current.completedSteps.has("instance")).toBe(false);
      expect(result.current.visitedSteps.has("instance")).toBe(false);
    });
  });
});

describe("dependency invalidation with persistence", () => {
  it("is not undone by re-hydration from storage", async () => {
    // A persistence adapter that already holds navigation meta, as it would
    // after a previous session.
    const store: Record<string, any> = {
      __wizzard_meta__: {
        currentStepId: "provider",
        visited: ["provider", "instance"],
        completed: ["instance"],
        history: ["provider", "instance", "provider"],
      },
    };
    const adapter = {
      saveStep: <V,>(id: string, d: V) => {
        store[id] = d;
      },
      getStep: <V,>(id: string): V | undefined => store[id] as V,
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    };

    const steps: IStepConfig<any, any>[] = [
      { id: "provider", label: "Provider" },
      {
        id: "instance",
        label: "Instance",
        dependsOn: ["provider"],
        clearData: ["instance"],
      },
    ];

    const config = {
      steps,
      persistence: { adapter, mode: "onStepChange" as const },
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{ instance: "t3.micro" }}>
        {children}
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("provider"));
    await waitFor(() =>
      expect(result.current.visitedSteps.has("instance")).toBe(true)
    );

    act(() => {
      result.current.setData("provider", "gcp");
    });

    await waitFor(() => {
      expect(result.current.getData("instance")).toBeUndefined();
      expect(result.current.visitedSteps.has("instance")).toBe(false);
      expect(result.current.completedSteps.has("instance")).toBe(false);
    });

    // Let the debounced active-step resolution fire; re-hydration must not
    // resurrect the invalidated step.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    expect(result.current.visitedSteps.has("instance")).toBe(false);
    expect(result.current.completedSteps.has("instance")).toBe(false);
  });
});
