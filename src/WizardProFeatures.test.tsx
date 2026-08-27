import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  act,
  waitFor,
  renderHook,
} from "@testing-library/react";
import {
  WizardProvider,
  useWizardActions,
  useWizardState,
  useWizardError,
  useWizardContext,
} from "./context/WizardContext";
import { WizardStepRenderer } from "./components/WizardStepRenderer";
import { IStepConfig, IWizardConfig } from "./types";

// Helper component to interact with wizard in tests
const WizardConsumer = () => {
  const { currentStep, progress, activeStepsCount, history } = useWizardState();
  const { goToNextStep, reset, setData } = useWizardActions();

  return (
    <div>
      <div data-testid="current-step">{currentStep?.id}</div>
      <div data-testid="progress">{progress}</div>
      <div data-testid="steps-count">{activeStepsCount}</div>
      <div data-testid="history">{history.join(",")}</div>
      <button onClick={() => goToNextStep()} data-testid="next-btn">
        Next
      </button>
      <button onClick={() => reset()} data-testid="reset-btn">
        Reset
      </button>
      <button
        onClick={() => setData("showStep2", true)}
        data-testid="show-2-btn"
      >
        Show 2
      </button>
      <button
        onClick={() => setData("blockNext", true)}
        data-testid="block-btn"
      >
        Block
      </button>
    </div>
  );
};

describe("Wizard Pro Features", () => {
  const steps: IStepConfig<any, any>[] = [
    {
      id: "step1",
      label: "Step 1",
      component: () => <div>Step 1 Content</div>,
    },
    {
      id: "step2",
      label: "Step 2",
      condition: async (data: any) => {
        await new Promise((r) => setTimeout(r, 20));
        return !!data.showStep2;
      },
      component: () => <div>Step 2 Content</div>,
    },
    {
      id: "step3",
      label: "Step 3",
      beforeLeave: async (data: any, dir: string) => {
        if (dir === "next" && data.blockNext) return false;
        return true;
      },
      component: () => <div>Step 3 Content</div>,
    },
  ];

  it("should calculate progress and activeStepsCount correctly", async () => {
    render(
      <WizardProvider config={{ steps }}>
        <WizardConsumer />
      </WizardProvider>
    );

    // Initial state
    expect(screen.getByTestId("current-step")).toHaveTextContent("step1");
    // Initially only 2 steps active (step1, step3) because step2 condition is async and defaults to false
    await waitFor(() => {
      expect(screen.getByTestId("steps-count")).toHaveTextContent("2");
    });
    expect(screen.getByTestId("progress")).toHaveTextContent("50"); // (1/2) * 100
  });

  it("should handle async step conditions dynamically", async () => {
    render(
      <WizardProvider config={{ steps }}>
        <WizardConsumer />
      </WizardProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("steps-count")).toHaveTextContent("2");
    });

    // Show step 2
    await act(async () => {
      screen.getByTestId("show-2-btn").click();
    });

    // Wait for async condition to resolve
    await waitFor(
      () => {
        expect(screen.getByTestId("steps-count")).toHaveTextContent("3");
      },
      { timeout: 1000 }
    );
  });

  it("should respect beforeLeave guards", async () => {
    const calls: string[] = [];
    const guardedSteps: IStepConfig<any, any>[] = [
      {
        id: "a",
        label: "A",
        component: () => <div>Guard A</div>,
        beforeLeave: async (data: any, dir: string) => {
          calls.push(`a:${dir}`);
          return !(dir === "next" && data.blockA);
        },
      },
      {
        id: "b",
        label: "B",
        component: () => <div>Guard B</div>,
        // Returning undefined must NOT block: the guard is checked with a
        // strict `=== false`.
        beforeLeave: (_data: any, dir: string) => {
          calls.push(`b:${dir}`);
          return undefined as any;
        },
      },
      { id: "c", label: "C", component: () => <div>Guard C</div> },
    ];

    const config = { steps: guardedSteps };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WizardProvider config={config} initialData={{}}>
        {children}
        <WizardStepRenderer />
      </WizardProvider>
    );
    const { result } = renderHook(() => useWizardContext<any>(), { wrapper });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));
    expect(screen.getByText("Guard A")).toBeInTheDocument();

    // Guard blocks forward navigation.
    act(() => {
      result.current.setData("blockA", true);
    });
    await act(async () => {
      await result.current.goToNextStep();
    });
    expect(result.current.currentStepId).toBe("a");
    expect(calls).toContain("a:next");

    // goToStep reports the refusal.
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.goToStep("b");
    });
    expect(ok).toBe(false);
    expect(result.current.currentStepId).toBe("a");

    // Unblock and move on.
    act(() => {
      result.current.setData("blockA", false);
    });
    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("b"));

    // A guard returning undefined does not block.
    await act(async () => {
      await result.current.goToNextStep();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("c"));
    expect(calls).toContain("b:next");
    expect(screen.getByText("Guard C")).toBeInTheDocument();

    // Leaving "c" calls no guard: step c declares none.
    calls.length = 0;
    await act(async () => {
      result.current.goToPrevStep();
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("b"));
    expect(calls).toEqual([]);

    // Leaving "b" backwards does call its guard.
    await act(async () => {
      result.current.goToPrevStep();
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.currentStepId).toBe("a"));
    expect(calls).toContain("b:prev");
  });

  it("should reset wizard state", async () => {
    render(
      <WizardProvider config={{ steps }}>
        <WizardConsumer />
      </WizardProvider>
    );

    // Initial history should have first step if we track it on start (currently we track on visit)
    // Wait, current implementation: setHistory((prev) => [...prev, stepId]) in goToStep.
    // Initially the first step ID might not be in history if no navigation happened.

    // Go to next step to change state
    await act(async () => {
      screen.getByTestId("show-2-btn").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("steps-count")).toHaveTextContent("3")
    );

    await act(async () => {
      await screen.getByTestId("next-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("history")).toHaveTextContent("step2");
    });

    // Reset
    await act(async () => {
      screen.getByTestId("reset-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("current-step")).toHaveTextContent("step1");
      expect(screen.getByTestId("history")).toHaveTextContent("step1");
    });
  });

  it("should validate all active steps even after immediate data update", async () => {
    const config: IWizardConfig<any> = {
      steps: [
        { id: "step1", label: "Step 1" },
        {
          id: "step2",
          label: "Step 2",
          condition: (data: any) => data.showStep2 === true,
          validationAdapter: {
            validate: (data: any) =>
              ({
                isValid: !!data.step2Data,
                errors: !data.step2Data ? { someField: "Required" } : {},
              }) as any,
          },
        },
      ],
    };

    const { result } = renderHook(() => useWizardActions(), {
      wrapper: ({ children }) => (
        <WizardProvider config={config}>{children}</WizardProvider>
      ),
    });

    // 1. Initially only step1 is active.
    // 2. Update data to show step2 AND call validateAll immediately
    let validationResult: any;
    await act(async () => {
      result.current.updateData({ showStep2: true });
      validationResult = await result.current.validateAll();
    });

    // This should be FALSE because step2 is now active but step2Data is missing
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors.step2).toBeDefined();
  });

  it("should record history when using goToStep directly", async () => {
    const config: IWizardConfig<any> = {
      steps: [
        { id: "step1", label: "Step 1" },
        { id: "step2", label: "Step 2" },
        { id: "step3", label: "Step 3" },
      ],
    };

    const { result } = renderHook(
      () => {
        const state = useWizardState();
        const actions = useWizardActions();
        return { state, actions };
      },
      {
        wrapper: ({ children }) => (
          <WizardProvider config={config}>{children}</WizardProvider>
        ),
      }
    );

    await act(async () => {
      await result.current.actions.goToStep("step2");
    });
    expect(result.current.state.history).toEqual(["step1", "step2"]);

    await act(async () => {
      await result.current.actions.goToStep("step3");
    });
    expect(result.current.state.history).toEqual(["step1", "step2", "step3"]);
  });

  it("should toggle isBusy during async conditions", async () => {
    let resolveCondition: (val: boolean) => void = () => {};
    const config: IWizardConfig<any> = {
      steps: [
        { id: "step1", label: "Step 1" },
        {
          id: "step2",
          label: "Step 2",
          condition: () =>
            new Promise((resolve) => {
              resolveCondition = resolve;
            }),
        },
      ],
    };

    const { result } = renderHook(() => useWizardState(), {
      wrapper: ({ children }) => (
        <WizardProvider config={config}>{children}</WizardProvider>
      ),
    });

    // During async check it should be busy
    await waitFor(() => expect(result.current.isBusy).toBe(true));

    await act(async () => {
      resolveCondition(true);
    });

    await waitFor(() => expect(result.current.isBusy).toBe(false));
  });

  it("should hide steps with conditions by default until resolved", async () => {
    let resolveCondition: (val: boolean) => void = () => {};
    const config: IWizardConfig<any> = {
      steps: [
        { id: "step1", label: "Step 1" },
        {
          id: "step2",
          label: "Step 2",
          condition: () =>
            new Promise((resolve) => {
              resolveCondition = resolve;
            }),
        },
      ],
    };

    const { result } = renderHook(() => useWizardState(), {
      wrapper: ({ children }) => (
        <WizardProvider config={config}>{children}</WizardProvider>
      ),
    });

    // Step 2 should NOT be in activeSteps during pending condition
    expect(result.current.activeSteps.length).toBe(1);
    expect(
      result.current.activeSteps.find((s) => s.id === "step2")
    ).toBeUndefined();
    await waitFor(() => {
      expect(result.current.busySteps.has("step2")).toBe(true);
    });

    await act(async () => {
      resolveCondition(true);
    });

    // After resolution it should appear
    await waitFor(() => expect(result.current.activeSteps.length).toBe(2));
    expect(
      result.current.activeSteps.find((s) => s.id === "step2")
    ).toBeDefined();
    expect(result.current.busySteps.has("step2")).toBe(false);
  });

  it("should validate current step before resolving conditions for next steps", async () => {
    const log: string[] = [];
    const config: IWizardConfig<any> = {
      autoValidate: true,
      steps: [
        {
          id: "step1",
          label: "Step 1",
          validationAdapter: {
            validate: async () => {
              log.push("validate step1");
              return { isValid: false, errors: { field: "error" } };
            },
          },
        },
        {
          id: "step2",
          label: "Step 2",
          condition: async () => {
            log.push("condition step2");
            return true;
          },
        },
      ],
    };

    const { result } = renderHook(
      () => ({
        state: useWizardState(),
        actions: useWizardActions(),
      }),
      {
        wrapper: ({ children }) => (
          <WizardProvider config={config}>{children}</WizardProvider>
        ),
      }
    );

    // Wait for initial resolveActiveSteps to finish and clear log
    await waitFor(() =>
      expect(result.current.state.activeSteps.length).toBe(1)
    );
    log.length = 0;

    await act(async () => {
      await result.current.actions.goToNextStep();
    });

    // Should have validated step1 and stopped because it's invalid
    expect(log).toEqual(["validate step1"]);
    expect(log).not.toContain("condition step2");
    expect(result.current.state.currentStep?.id).toBe("step1");
  });

  it("should correctly find errors using useWizardError with prefixed paths", async () => {
    const config: IWizardConfig<any> = {
      steps: [
        {
          id: "security",
          label: "Security",
          validationAdapter: {
            validate: async () => ({
              isValid: false,
              errors: { "security.password": "min length 6" },
            }),
          },
        },
      ],
    };

    const { result } = renderHook(
      () => ({
        error: useWizardError("security.password"),
        actions: useWizardActions(),
      }),
      {
        wrapper: ({ children }) => (
          <WizardProvider config={config}>{children}</WizardProvider>
        ),
      }
    );

    await act(async () => {
      await result.current.actions.validateStep("security");
    });

    expect(result.current.error).toBe("min length 6");
  });
});
