import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useSyncExternalStore,
  useRef,
  useTransition,
} from "react";
import type {
  IWizardConfig,
  PersistenceMode,
  IPersistenceAdapter,
  IStepConfig,
  IWizardContext,
} from "../types";
import { MemoryAdapter } from "../adapters/persistence/MemoryAdapter";
import { getByPath, setByPath } from "../utils/data";

export interface IWizardState<T = unknown> {
  currentStep: IStepConfig<unknown, T> | null;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  isPending: boolean;
  activeSteps: IStepConfig<unknown, T>[];
  visitedSteps: Set<string>;
  completedSteps: Set<string>;
  errorSteps: Set<string>;
  store: WizardStore<T>;
}

export interface IWizardActions {
  goToNextStep: () => Promise<void>;
  goToPrevStep: () => void;
  goToStep: (stepId: string) => Promise<boolean>;
  setStepData: (stepId: string, data: unknown) => void;
  handleStepChange: (field: string, value: unknown) => void;
  validateStep: (sid: string) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  save: () => void;
  clearStorage: () => void;
  setData: (
    path: string,
    value: unknown,
    options?: { debounceValidation?: number }
  ) => void;
  updateData: (data: Partial<any>, options?: { replace?: boolean }) => void;
  getData: (path: string, defaultValue?: unknown) => unknown;
}

const WizardStateContext = createContext<IWizardState<any> | undefined>(
  undefined
);
const WizardActionsContext = createContext<IWizardActions | undefined>(
  undefined
);

// Advanced: Store for granular subscriptions
export class WizardStore<T> {
  private state: { data: T; errors: Record<string, Record<string, string>> };
  private listeners: Set<() => void> = new Set();

  constructor(initialData: T) {
    this.state = { data: initialData, errors: {} };
  }

  getSnapshot = () => this.state;

  update(newData: T) {
    this.state = { ...this.state, data: newData };
    this.notify();
  }

  updateErrors(newErrors: Record<string, Record<string, string>>) {
    this.state = { ...this.state, errors: newErrors };
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

interface WizardProviderProps<T> {
  config: IWizardConfig<T>;
  initialData?: T;
  initialStepId?: string; // New: Start from any step
  children: React.ReactNode;
}

export function WizardProvider<T extends Record<string, any>>({
  config,
  initialData,
  initialStepId,
  children,
}: WizardProviderProps<T>) {
  const [currentStepId, setCurrentStepId] = useState<string>("");
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [errorSteps, setErrorSteps] = useState<Set<string>>(new Set());
  const [, setAllErrorsState] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  // Store for granular data and errors
  const storeRef = useRef(new WizardStore<T>((initialData || {}) as T));

  // local state for dependencies
  const [wizardData, setWizardData] = useState<T>((initialData || {}) as T);

  // Persistence Setup
  const persistenceAdapter = useMemo<IPersistenceAdapter>(() => {
    return config.persistence?.adapter || new MemoryAdapter();
  }, [config.persistence?.adapter]);

  const persistenceMode = config.persistence?.mode || "onStepChange";

  // Calculate Active Steps (Conditional Logic) - Stabilized to prevent global re-renders
  const [activeSteps, setActiveSteps] = useState(() =>
    config.steps.filter((s) => !s.condition || s.condition(wizardData))
  );

  useEffect(() => {
    const nextActiveSteps = config.steps.filter((step) => {
      if (step.condition) {
        return step.condition(wizardData);
      }
      return true;
    });

    // Simple ID check for stability
    const currentIds = activeSteps.map((s) => s.id).join(",");
    const nextIds = nextActiveSteps.map((s) => s.id).join(",");

    if (currentIds !== nextIds) {
      setActiveSteps(nextActiveSteps);
    }
  }, [config.steps, wizardData, activeSteps]);

  // Set initial step if not set (with optional initialStepId)
  useEffect(() => {
    if (!currentStepId && activeSteps.length > 0) {
      if (initialStepId) {
        // Validation: verify initialStepId exists in active steps
        const target = activeSteps.find((s) => s.id === initialStepId);
        if (target) {
          setCurrentStepId(target.id);
        } else {
          // Fallback if initial is invalid/hidden
          setCurrentStepId(activeSteps[0].id);
        }
      } else {
        setCurrentStepId(activeSteps[0].id);
      }
      setIsLoading(false);
    }
  }, [activeSteps, currentStepId, initialStepId]);

  // Derived state
  const currentStep = useMemo(
    () => activeSteps.find((s) => s.id === currentStepId) || null,
    [activeSteps, currentStepId]
  );
  const currentStepIndex = useMemo(
    () => activeSteps.findIndex((s) => s.id === currentStepId),
    [activeSteps, currentStepId]
  );
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  // Constants
  const META_KEY = "__wizzard_meta__";

  // Hydration Helper
  const hydrate = useCallback(() => {
    setIsLoading(true);

    const metaFn = persistenceAdapter.getStep<{
      currentStepId: string;
      visited: string[];
      completed: string[];
    }>(META_KEY);

    if (metaFn) {
      if (metaFn.currentStepId) setCurrentStepId(metaFn.currentStepId);
      if (metaFn.visited) setVisitedSteps(new Set(metaFn.visited));
      if (metaFn.completed) setCompletedSteps(new Set(metaFn.completed));
    }

    const loadedData: Partial<T> = {};
    config.steps.forEach((step) => {
      const stepData = persistenceAdapter.getStep(step.id);
      if (stepData) {
        Object.assign(loadedData, stepData);
      }
    });

    if (Object.keys(loadedData).length > 0) {
      setWizardData((prev) => {
        const newData = { ...prev, ...loadedData };
        storeRef.current.update(newData);
        return newData;
      });
    }
    setIsLoading(false);
  }, [config.steps, persistenceAdapter]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Save logic stabilized
  const saveData = useCallback(
    (mode: PersistenceMode, stepId: string, data: any) => {
      // Granular Check: Does the current step have a custom adapter?
      const stepConfig = config.steps.find((s) => s.id === stepId);
      const stepAdapter = stepConfig?.persistenceAdapter;

      // Determine which adapter to use (Granular > Global > Default)
      const adapterToUse = stepAdapter || persistenceAdapter;

      if (mode === persistenceMode || mode === "manual") {
        adapterToUse.saveStep(stepId, data);
      }
    },
    [persistenceAdapter, persistenceMode, config.steps]
  );

  // Debounce timeout for validation
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const validateStep = useCallback(
    async (stepId: string, data: T): Promise<boolean> => {
      const step = config.steps.find((s) => s.id === stepId);
      if (!step || !step.validationAdapter) return true;

      const result = await step.validationAdapter.validate(data);

      if (!result.isValid) {
        const newAllErrors = {
          ...storeRef.current.getSnapshot().errors,
          [stepId]: result.errors || {},
        };
        storeRef.current.updateErrors(newAllErrors);
        setAllErrorsState(newAllErrors);
        setErrorSteps((prev) => {
          const next = new Set(prev);
          next.add(stepId);
          return next;
        });
        return false;
      } else {
        const newAllErrors = { ...storeRef.current.getSnapshot().errors };
        delete newAllErrors[stepId];
        storeRef.current.updateErrors(newAllErrors);
        setAllErrorsState(newAllErrors);
        setErrorSteps((prev) => {
          const next = new Set(prev);
          next.delete(stepId);
          return next;
        });
        return true;
      }
    },
    [config.steps]
  );

  // Actions stabilized with useCallback
  const setStepData = useCallback(
    (stepId: string, data: any) => {
      const prevData = storeRef.current.getSnapshot().data;
      const newData = { ...prevData, ...data };

      storeRef.current.update(newData);
      startTransition(() => {
        setWizardData(newData);
      });

      if (persistenceMode === "onChange") {
        saveData("onChange", stepId, newData);
      }
    },
    [persistenceMode, saveData]
  );

  const setData = useCallback(
    (path: string, value: any, options?: { debounceValidation?: number }) => {
      const prevData = storeRef.current.getSnapshot().data;
      const newData = setByPath(prevData, path, value);

      // 1. Immediate store update (for useWizardValue)
      storeRef.current.update(newData);

      // 2. Transition update (for useWizardState/Summary)
      startTransition(() => {
        setWizardData(newData);
      });

      // 3. Debounced validation logic
      if (options?.debounceValidation) {
        if (validationTimeoutRef.current)
          clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = setTimeout(() => {
          try {
            validateStep(currentStepId, newData).catch((err) => {
              console.error("[Wizard] Debounced validation failed:", err);
            });
          } catch (e) {
            console.error("[Wizard] Error starting validation:", e);
          }
        }, options.debounceValidation);
      } else {
        validateStep(currentStepId, newData);
      }

      if (persistenceMode === "onChange") {
        saveData("onChange", currentStepId, newData);
      }
    },
    [persistenceMode, saveData, currentStepId, validateStep]
  );

  const updateData = useCallback(
    (data: Partial<T>, options?: { replace?: boolean }) => {
      const prevData = storeRef.current.getSnapshot().data;
      const newData = options?.replace ? (data as T) : { ...prevData, ...data };

      // 1. Update Store
      storeRef.current.update(newData);

      // 2. Update React State
      startTransition(() => {
        setWizardData(newData);
      });

      // 3. Persist
      // Auto-fill should implicitly update storage regardless of mode
      config.steps.forEach((step) => {
        saveData("manual", step.id, newData);
      });
    },
    [saveData, config.steps]
  );

  const getData = useCallback((path: string, defaultValue?: any) => {
    return getByPath(storeRef.current.getSnapshot().data, path, defaultValue);
  }, []);

  // Action: Handle specific field change (helper)
  const handleStepChange = useCallback(
    (field: string, value: any) => {
      if (!currentStepId) return;
      setData(field, value);
    },
    [setData, currentStepId]
  );

  const validateAll = useCallback(async (): Promise<boolean> => {
    let isValid = true;
    const currentData = storeRef.current.getSnapshot().data;
    for (const step of activeSteps) {
      const stepValid = await validateStep(step.id, currentData);
      if (!stepValid) isValid = false;
    }
    return isValid;
  }, [activeSteps, validateStep]);

  const goToStep = useCallback(
    async (stepId: string): Promise<boolean> => {
      const targetIndex = activeSteps.findIndex((s) => s.id === stepId);
      if (targetIndex === -1) return false;

      const currentData = storeRef.current.getSnapshot().data;

      if (targetIndex > currentStepIndex) {
        const shouldValidate =
          currentStep?.autoValidate ?? config.autoValidate ?? true;
        if (shouldValidate) {
          const isValid = await validateStep(currentStepId, currentData);
          if (!isValid) return false;
        }
      }

      if (persistenceMode === "onStepChange" && currentStep) {
        saveData("onStepChange", currentStepId, currentData);
      }

      const nextVisited = new Set(visitedSteps).add(currentStepId);
      setVisitedSteps(nextVisited);
      setCurrentStepId(stepId);

      if (persistenceMode !== "manual") {
        persistenceAdapter.saveStep(META_KEY, {
          currentStepId: stepId,
          visited: Array.from(nextVisited),
          completed: Array.from(completedSteps),
        });
      }

      // Lifecycle Callback
      if (config.onStepChange) {
        config.onStepChange(currentStepId, stepId, currentData); // Call hook
      }

      window.scrollTo(0, 0);
      return true;
    },
    [
      activeSteps,
      currentStepId,
      currentStep,
      currentStepIndex,
      config.autoValidate,
      persistenceMode,
      saveData,
      validateStep,
      visitedSteps,
      completedSteps,
      persistenceAdapter,
    ]
  );

  const goToNextStep = useCallback(async () => {
    if (isLastStep) return;
    const nextStep = activeSteps[currentStepIndex + 1];
    if (nextStep) {
      const success = await goToStep(nextStep.id);
      if (success) {
        const nextCompleted = new Set(completedSteps).add(currentStepId);
        setCompletedSteps(nextCompleted);

        if (persistenceMode !== "manual") {
          persistenceAdapter.saveStep(META_KEY, {
            currentStepId: nextStep.id,
            visited: Array.from(new Set(visitedSteps).add(currentStepId)),
            completed: Array.from(nextCompleted),
          });
        }
      }
    }
  }, [
    activeSteps,
    currentStepIndex,
    isLastStep,
    currentStepId,
    goToStep,
    visitedSteps,
    completedSteps,
    persistenceMode,
    persistenceAdapter,
  ]);

  const goToPrevStep = useCallback(() => {
    if (isFirstStep) return;
    const prevStep = activeSteps[currentStepIndex - 1];
    if (prevStep) {
      goToStep(prevStep.id);
    }
  }, [activeSteps, currentStepIndex, isFirstStep, goToStep]);

  const clearStorage = useCallback(
    () => persistenceAdapter.clear(),
    [persistenceAdapter]
  );

  const save = useCallback(
    () =>
      saveData("manual", currentStepId, storeRef.current.getSnapshot().data),
    [saveData, currentStepId]
  );

  // Split values
  const stateValue = useMemo<IWizardState<T>>(
    () => ({
      currentStep,
      currentStepIndex,
      isFirstStep,
      isLastStep,
      isLoading,
      isPending,
      activeSteps,
      visitedSteps,
      completedSteps,
      errorSteps,
      store: storeRef.current,
    }),
    [
      currentStep,
      currentStepIndex,
      isFirstStep,
      isLastStep,
      isLoading,
      isPending,
      activeSteps,
      visitedSteps,
      completedSteps,
      errorSteps,
    ]
  );

  const actionsValue = useMemo<IWizardActions>(
    () => ({
      goToNextStep,
      goToPrevStep,
      goToStep,
      setStepData,
      handleStepChange,
      validateStep: (sid: string) =>
        validateStep(sid, storeRef.current.getSnapshot().data),
      validateAll,
      save,
      clearStorage,
      setData,
      updateData,
      getData,
    }),
    [
      goToNextStep,
      goToPrevStep,
      goToStep,
      setStepData,
      handleStepChange,
      validateStep,
      validateAll,
      save,
      clearStorage,
      setData,
      updateData,
      getData,
    ]
  );

  return (
    <WizardStateContext.Provider value={stateValue}>
      <WizardActionsContext.Provider value={actionsValue}>
        {children}
      </WizardActionsContext.Provider>
    </WizardStateContext.Provider>
  );
}

export function useWizardState<T = unknown>(): IWizardState<T> {
  const context = useContext(WizardStateContext);
  if (!context) {
    throw new Error("useWizardState must be used within a WizardProvider");
  }
  return context as IWizardState<T>;
}

export function useWizardValue<TValue = any>(path: string): TValue {
  const { store } = useWizardState();
  const lastStateRef = useRef<any>(null);
  const lastValueRef = useRef<any>(null);

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    const data = fullState.data;
    if (data === lastStateRef.current) {
      return lastValueRef.current;
    }
    const value = getByPath(data, path);
    lastStateRef.current = data;
    lastValueRef.current = value;
    return value;
  }, [store, path]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardError(path: string): string | undefined {
  const { store } = useWizardState();
  const lastStateRef = useRef<any>(null);
  const lastValueRef = useRef<any>(null);

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    const errors = fullState.errors;
    if (errors === lastStateRef.current) {
      return lastValueRef.current;
    }

    // Flatten errors from all steps or use a specific step?
    // Usually validation results are nested like { children: { "0.name": "error" } }
    // but the adapter flattened them to "children.0.name"
    let foundError: string | undefined;
    Object.values(errors).forEach((stepErrors) => {
      const typedStepErrors = stepErrors as Record<string, string>;
      if (typedStepErrors[path]) foundError = typedStepErrors[path];
    });

    lastStateRef.current = errors;
    lastValueRef.current = foundError;
    return foundError;
  }, [store, path]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardSelector<TSelected = any>(
  selector: (state: any) => TSelected
): TSelected {
  const { store } = useWizardState();
  const lastStateRef = useRef<any>(null);
  const lastResultRef = useRef<any>(null);

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    if (fullState === lastStateRef.current) {
      return lastResultRef.current;
    }
    // We pass only data to the selector for convenience, or the whole store state?
    // Let's pass the whole thing in case they need errors
    const result = selector(fullState.data);
    lastStateRef.current = fullState;
    lastResultRef.current = result;
    return result;
  }, [store, selector]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardActions(): IWizardActions {
  const context = useContext(WizardActionsContext);
  if (!context) {
    throw new Error("useWizardActions must be used within a WizardProvider");
  }
  return context;
}

export function useWizardContext<T = any>(): IWizardContext<T> & {
  store: WizardStore<T>;
} {
  const state = useWizardState<T>();
  const actions = useWizardActions();

  // Backward compatibility: subscribe to everything
  const wizardData = useWizardSelector<T>((s) => s as T);
  const fullState = state.store.getSnapshot();

  return useMemo(
    () => ({
      ...state,
      ...actions,
      wizardData,
      allErrors: fullState.errors,
    }),
    [state, actions, wizardData, fullState.errors]
  );
}
