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

export interface IWizardState<T = unknown, StepId extends string = string> {
  currentStep: IStepConfig<unknown, T, StepId> | null;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  isPending: boolean;
  activeSteps: IStepConfig<unknown, T, StepId>[];
  visitedSteps: Set<StepId>;
  completedSteps: Set<StepId>;
  errorSteps: Set<StepId>;
  store: WizardStore<T>;
}

export interface IWizardActions<StepId extends string = string> {
  goToNextStep: () => Promise<void>;
  goToPrevStep: () => void;
  goToStep: (stepId: StepId) => Promise<boolean>;
  setStepData: (stepId: StepId, data: unknown) => void;
  handleStepChange: (field: string, value: unknown) => void;
  validateStep: (sid: StepId) => Promise<boolean>;
  validateAll: () => Promise<{
    isValid: boolean;
    errors: Record<string, Record<string, string>>;
  }>;
  save: (stepIds?: StepId | StepId[] | boolean) => void;
  clearStorage: () => void;
  setData: (
    path: string,
    value: unknown,
    options?: { debounceValidation?: number }
  ) => void;
  updateData: (
    data: Partial<any>,
    options?: { replace?: boolean; persist?: boolean }
  ) => void;
  getData: (path: string, defaultValue?: unknown) => unknown;
}

const WizardStateContext = createContext<IWizardState<any, any> | undefined>(
  undefined
);
const WizardActionsContext = createContext<IWizardActions<any> | undefined>(
  undefined
);

// Advanced: Store for granular subscriptions
export class WizardStore<T> {
  private state: { data: T; errors: Record<string, Record<string, string>> };
  private listeners = new Set<() => void>();
  errorsMap = new Map<string, Map<string, string>>();

  constructor(initialData: T) {
    this.state = {
      data: initialData,
      errors: {},
    };
  }

  getSnapshot() {
    return this.state;
  }

  update(newData: T) {
    this.state = { ...this.state, data: newData };
    this.notify();
  }

  // Sync internal Map to external Object (for backward compat)
  private syncErrors() {
    const newErrorsObj: Record<string, Record<string, string>> = {};
    for (const [stepId, fieldErrors] of this.errorsMap.entries()) {
      if (fieldErrors.size > 0) {
        newErrorsObj[stepId] = Object.fromEntries(fieldErrors);
      }
    }
    this.state = { ...this.state, errors: newErrorsObj };
    this.notify();
  }

  // Update from Object (Legacy/State setter)
  updateErrors(newErrors: Record<string, Record<string, string>>) {
    // Re-build Map to stay in sync
    this.errorsMap.clear();
    for (const [stepId, fieldErrors] of Object.entries(newErrors)) {
      const stepMap = new Map<string, string>();
      for (const [field, msg] of Object.entries(fieldErrors)) {
        stepMap.set(field, msg);
      }
      if (stepMap.size > 0) this.errorsMap.set(stepId, stepMap);
    }
    this.state = { ...this.state, errors: newErrors };
    this.notify();
  }

  // Optimize: Update Step Errors directly (O(1) Map updated, then Sync)
  setStepErrors(
    stepId: string,
    errors: Record<string, string> | undefined | null
  ) {
    if (!errors || Object.keys(errors).length === 0) {
      if (this.errorsMap.has(stepId)) {
        this.errorsMap.delete(stepId);
        this.syncErrors();
        return true; // changed
      }
      return false;
    }

    // Update Map
    const stepMap = new Map<string, string>();
    for (const [field, msg] of Object.entries(errors)) {
      stepMap.set(field, msg);
    }
    this.errorsMap.set(stepId, stepMap);

    this.syncErrors();
    return true;
  }

  // Fast Delete (O(1))
  deleteError(stepId: string, path: string): boolean {
    const stepErrors = this.errorsMap.get(stepId);
    if (!stepErrors) return false;

    if (stepErrors.has(path)) {
      stepErrors.delete(path);
      if (stepErrors.size === 0) {
        this.errorsMap.delete(stepId);
      }
      // Sync to object for public state
      this.syncErrors();
      return true;
    }
    return false;
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

interface WizardProviderProps<T, StepId extends string> {
  config: IWizardConfig<T, StepId>;
  initialData?: T;
  initialStepId?: StepId; // New: Start from any step
  children: React.ReactNode;
}

export function WizardProvider<
  T extends Record<string, any>,
  StepId extends string = string,
>({
  config,
  initialData,
  initialStepId,
  children,
}: WizardProviderProps<T, StepId>) {
  const [currentStepId, setCurrentStepId] = useState<StepId | "">("");
  // Optimize: Keep ref to currentStepId to avoid recreating setData on every step change
  const currentStepIdRef = useRef<StepId | "">(currentStepId);
  useEffect(() => {
    currentStepIdRef.current = currentStepId;
  }, [currentStepId]);

  const [visitedSteps, setVisitedSteps] = useState<Set<StepId>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [errorSteps, setErrorSteps] = useState<Set<StepId>>(new Set());
  const [, setAllErrorsState] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  // Store for granular data and errors
  const storeRef = useRef(new WizardStore<T>((initialData || {}) as T));

  // Persistence Setup
  const persistenceAdapter = useMemo<IPersistenceAdapter>(() => {
    return config.persistence?.adapter || new MemoryAdapter();
  }, [config.persistence?.adapter]);

  const persistenceMode = config.persistence?.mode || "onStepChange";

  // --- Optimization: Static Step Map ---
  const stepsMap = useMemo(() => {
    const map = new Map<StepId, IStepConfig<any, T, StepId>>();
    config.steps.forEach((step: IStepConfig<any, T, StepId>) =>
      map.set(step.id, step)
    );
    return map;
  }, [config.steps]);

  // We use a ref to track the last calculated steps to ensure referential strictness
  const lastActiveStepsRef = useRef<IStepConfig<any, T, StepId>[]>([]);

  // Optimized: Calculate Active Steps reactively from the store
  const activeSteps = useSyncExternalStore(
    storeRef.current.subscribe,
    useCallback(() => {
      const currentData = storeRef.current.getSnapshot().data;
      const nextActiveSteps = config.steps.filter(
        (step: IStepConfig<any, T, StepId>) => {
          if (step.condition) {
            return step.condition(currentData);
          }
          return true;
        }
      );

      // Check if structure changed (ids match) - shallow check optimized for step stability
      const prevIds = lastActiveStepsRef.current.map((s) => s.id).join(".");
      const nextIds = nextActiveSteps.map((s) => s.id).join(".");

      if (prevIds === nextIds && lastActiveStepsRef.current.length > 0) {
        return lastActiveStepsRef.current;
      }

      lastActiveStepsRef.current = nextActiveSteps;
      return nextActiveSteps;
    }, [config.steps])
  );

  const activeStepsIndexMap = useMemo(() => {
    const map = new Map<StepId, number>();
    activeSteps.forEach((s: IStepConfig<any, T, StepId>, i: number) =>
      map.set(s.id, i)
    );
    return map;
  }, [activeSteps]);

  // Set initial step if not set (with optional initialStepId)
  useEffect(() => {
    if (!currentStepId && activeSteps.length > 0) {
      if (initialStepId) {
        // Validation: verify initialStepId exists in active steps
        const target = activeSteps.find(
          (s: IStepConfig<any, T, StepId>) => s.id === initialStepId
        );
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

  // --- Optimization: Stable State Reference ---
  // We hold all "changing" values in a ref so actions can remain stable
  const stateRef = useRef({
    config,
    stepsMap,
    activeSteps,
    activeStepsIndexMap,
    visitedSteps,
    completedSteps,
    persistenceMode,
    persistenceAdapter,
    currentStepId,
  });

  // Update ref on every render - this is fast
  stateRef.current = {
    config,
    stepsMap,
    activeSteps,
    activeStepsIndexMap,
    visitedSteps,
    completedSteps,
    persistenceMode,
    persistenceAdapter,
    currentStepId,
  };

  // Derived state
  const currentStep = useMemo(
    () => stepsMap.get(currentStepId as StepId) || null,
    [stepsMap, currentStepId]
  );
  const currentStepIndex = useMemo(
    () => activeStepsIndexMap.get(currentStepId as StepId) ?? -1,
    [activeStepsIndexMap, currentStepId]
  );
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  // Constants
  const META_KEY = "__wizzard_meta__";

  // Hydration Helper
  // Hydration Helper
  const hydrate = useCallback(() => {
    setIsLoading(true);
    const { persistenceAdapter, config } = stateRef.current;

    const metaFn = persistenceAdapter.getStep<{
      currentStepId: string;
      visited: string[];
      completed: string[];
    }>(META_KEY);

    if (metaFn) {
      if (metaFn.currentStepId)
        setCurrentStepId(metaFn.currentStepId as StepId);
      if (metaFn.visited) setVisitedSteps(new Set(metaFn.visited as StepId[]));
      if (metaFn.completed)
        setCompletedSteps(new Set(metaFn.completed as StepId[]));
    }

    const loadedData: Partial<T> = {};
    config.steps.forEach((step) => {
      const stepData = persistenceAdapter.getStep(step.id);
      if (stepData) {
        Object.assign(loadedData, stepData);
      }
    });

    if (Object.keys(loadedData).length > 0) {
      const currentData = storeRef.current.getSnapshot().data;
      const newData = { ...currentData, ...loadedData };
      storeRef.current.update(newData);
    }
    setIsLoading(false);
  }, []); // Empty dependency array!

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Save logic stabilized
  const saveData = useCallback(
    (mode: PersistenceMode, stepId: StepId, data: any) => {
      const {
        stepsMap,
        persistenceAdapter,
        persistenceMode: globalMode,
      } = stateRef.current;
      const stepConfig = stepsMap.get(stepId);
      const stepAdapter = stepConfig?.persistenceAdapter;
      const stepMode = stepConfig?.persistenceMode;
      const adapterToUse = stepAdapter || persistenceAdapter;
      const modeToUse = stepMode || globalMode;

      if (mode === modeToUse || mode === "manual") {
        adapterToUse.saveStep(stepId, data);
      }
    },
    []
  );

  // Debounce timeout for validation
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const validateStep = useCallback(
    async (stepId: StepId, data: T): Promise<boolean> => {
      const { stepsMap } = stateRef.current;
      const step = stepsMap.get(stepId);
      if (!step || !step.validationAdapter) {
        return true;
      }

      const result = await step.validationAdapter.validate(data);

      if (result.isValid) {
        // Clear errors for this step
        // Optimized: Use Store Method
        const changed = storeRef.current.setStepErrors(stepId, null);

        if (changed) {
          setAllErrorsState(storeRef.current.getSnapshot().errors);
          setErrorSteps((prev) => {
            const next = new Set(prev);
            next.delete(stepId);
            return next;
          });
        }
        return true;
      } else {
        // Set errors for this step
        // Optimized: Use Store Method
        storeRef.current.setStepErrors(stepId, result.errors || null);
        setAllErrorsState(storeRef.current.getSnapshot().errors);

        setErrorSteps((prev) => {
          const next = new Set(prev);
          next.add(stepId);
          return next;
        });
        return false;
      }
    },
    []
  );

  // Actions stabilized with useCallback
  const setStepData = useCallback(
    (stepId: StepId, data: any) => {
      const { persistenceMode } = stateRef.current;
      const prevData = storeRef.current.getSnapshot().data;
      const newData = { ...prevData, ...data };

      storeRef.current.update(newData);

      const stepConfig = stateRef.current.stepsMap.get(stepId as StepId);
      const effectiveMode = stepConfig?.persistenceMode || persistenceMode;

      if (effectiveMode === "onChange") {
        saveData("onChange", stepId, newData);
      }
    },
    [saveData]
  );

  const setData = useCallback(
    (path: string, value: any, options?: { debounceValidation?: number }) => {
      const { persistenceMode, stepsMap } = stateRef.current;
      const prevData = storeRef.current.getSnapshot().data;

      const currentValue = getByPath(prevData, path);
      if (currentValue === value) return;

      const newData = setByPath(prevData, path, value);

      // --- Batching Strategy: Update Store First ---
      storeRef.current.update(newData);

      const activeStepId = stateRef.current.currentStepId;
      const stepConfig = stepsMap.get(activeStepId as StepId);

      // 4. Clear Error on Input (UX Improvement + Optimization)
      if (activeStepId) {
        const wasDeleted = storeRef.current.deleteError(activeStepId, path);
        if (wasDeleted) {
          // Check if step is now clean to update errorSteps
          if (!storeRef.current.errorsMap.has(activeStepId)) {
            setErrorSteps((prev) => {
              const next = new Set(prev);
              next.delete(activeStepId);
              return next;
            });
          }
        }
      }

      // Sync React state last - only for errors to update errorSteps
      if (activeStepId && storeRef.current.getSnapshot().errors[activeStepId]) {
        startTransition(() => {
          setAllErrorsState(storeRef.current.getSnapshot().errors);
        });
      }

      // Determine Validation Mode
      const { config } = stateRef.current;
      const mode =
        stepConfig?.validationMode ?? config.validationMode ?? "onStepChange";

      // 3. Conditional Validation Logic
      if (mode === "onChange") {
        if (options?.debounceValidation) {
          if (validationTimeoutRef.current)
            clearTimeout(validationTimeoutRef.current);
          validationTimeoutRef.current = setTimeout(() => {
            try {
              if (activeStepId) {
                validateStep(activeStepId as StepId, newData).catch((err) => {
                  console.error("[Wizard] Debounced validation failed:", err);
                });
              }
            } catch (e) {
              console.error("[Wizard] Error starting validation:", e);
            }
          }, options.debounceValidation);
        } else {
          if (activeStepId) validateStep(activeStepId as StepId, newData);
        }
      }

      const effectivePersistenceMode =
        stepConfig?.persistenceMode ?? persistenceMode;
      if (effectivePersistenceMode === "onChange" && activeStepId) {
        saveData("onChange", activeStepId as StepId, newData);
      }
    },
    [saveData, validateStep]
  );

  const updateData = useCallback(
    (data: Partial<T>, options?: { replace?: boolean; persist?: boolean }) => {
      const { config } = stateRef.current;
      const prevData = storeRef.current.getSnapshot().data;
      const newData = options?.replace ? (data as T) : { ...prevData, ...data };

      storeRef.current.update(newData);

      if (options?.persist) {
        config.steps.forEach((step) => {
          saveData("manual", step.id, newData);
        });
      }
    },
    [saveData]
  );

  const getData = useCallback((path: string, defaultValue?: any) => {
    return getByPath(storeRef.current.getSnapshot().data, path, defaultValue);
  }, []);

  // Action: Handle specific field change (helper)
  const handleStepChange = useCallback(
    (field: string, value: any) => {
      const { currentStepId } = stateRef.current;
      if (!currentStepId) return;
      setData(field, value);
    },
    [setData]
  );

  const validateAll = useCallback(async (): Promise<{
    isValid: boolean;
    errors: Record<string, Record<string, string>>;
  }> => {
    const { activeSteps } = stateRef.current;

    // Optimization: Parallel validation
    const currentData = storeRef.current.getSnapshot().data;
    const validationResults = await Promise.all(
      activeSteps.map((step: IStepConfig<any, T, StepId>) =>
        validateStep(step.id, currentData)
      )
    );

    const isValid = validationResults.every(Boolean);
    const finalErrors = storeRef.current.getSnapshot().errors;
    return { isValid, errors: finalErrors };
  }, [validateStep]);

  const goToStep = useCallback(
    async (stepId: StepId): Promise<boolean> => {
      const {
        activeStepsIndexMap,
        currentStepId,
        config,
        persistenceMode,
        visitedSteps,
        completedSteps,
        persistenceAdapter,
        stepsMap,
      } = stateRef.current;

      const targetIndex = activeStepsIndexMap.get(stepId) ?? -1;
      if (targetIndex === -1) return false;

      const currentData = storeRef.current.getSnapshot().data;
      const currentStepIndex =
        activeStepsIndexMap.get(currentStepId as StepId) ?? -1;
      const currentStep = stepsMap.get(currentStepId as StepId);

      if (targetIndex > currentStepIndex) {
        const shouldValidate =
          currentStep?.autoValidate ?? config.autoValidate ?? false;
        const mode =
          currentStep?.validationMode ??
          config.validationMode ??
          "onStepChange";

        if ((shouldValidate || mode === "onStepChange") && currentStepId) {
          const isValid = await validateStep(
            currentStepId as StepId,
            currentData
          );
          if (!isValid) return false;
        }
      }

      if (currentStep && currentStepId) {
        const effectivePersistenceMode =
          currentStep.persistenceMode ?? persistenceMode;
        if (effectivePersistenceMode === "onStepChange") {
          saveData("onStepChange", currentStepId as StepId, currentData);
        }
      }

      const nextVisited = new Set(visitedSteps);
      if (currentStepId) nextVisited.add(currentStepId as StepId);

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
        config.onStepChange(currentStepId || null, stepId, currentData); // Call hook
      }

      window.scrollTo(0, 0);
      return true;
    },
    [saveData, validateStep]
  );

  const goToNextStep = useCallback(async () => {
    const {
      activeSteps,
      activeStepsIndexMap,
      currentStepId,
      completedSteps,
      persistenceMode,
    } = stateRef.current;
    const currentStepIndex =
      activeStepsIndexMap.get(currentStepId as StepId) ?? -1;

    if (currentStepIndex === -1 || currentStepIndex === activeSteps.length - 1)
      return;

    const nextStep = activeSteps[currentStepIndex + 1];
    if (nextStep) {
      const success = await goToStep(nextStep.id);
      if (success) {
        const nextCompleted = new Set(completedSteps).add(
          currentStepId as StepId
        );
        setCompletedSteps(nextCompleted);

        if (persistenceMode !== "manual") {
          persistenceAdapter.saveStep(META_KEY, {
            currentStepId: nextStep.id,
            visited: Array.from(
              new Set(visitedSteps).add(currentStepId as StepId)
            ),
            completed: Array.from(nextCompleted),
          });
        }
      }
    }
  }, [goToStep]); // Only depends on goToStep (which is stable)

  const goToPrevStep = useCallback(() => {
    const { activeSteps, activeStepsIndexMap, currentStepId } =
      stateRef.current;
    const currentStepIndex =
      activeStepsIndexMap.get(currentStepId as StepId) ?? -1;
    if (currentStepIndex <= 0) return;
    const prevStep = activeSteps[currentStepIndex - 1];
    if (prevStep) {
      goToStep(prevStep.id);
    }
  }, [goToStep]);

  const clearStorage = useCallback(() => {
    stateRef.current.persistenceAdapter.clear();
  }, []);

  const save = useCallback(
    (stepIds?: StepId | StepId[] | boolean) => {
      const { config, currentStepId } = stateRef.current;
      const data = storeRef.current.getSnapshot().data;

      if (stepIds === true) {
        config.steps.forEach((step) => {
          saveData("manual", step.id, data);
        });
        return;
      }

      if (!stepIds) {
        if (currentStepId) {
          saveData("manual", currentStepId as StepId, data);
        }
        return;
      }

      const ids = Array.isArray(stepIds) ? stepIds : [stepIds];
      ids.forEach((id) => {
        saveData("manual", id, data);
      });
    },
    [saveData]
  );

  // Split values
  const stateValue = useMemo<IWizardState<T, StepId>>(
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

  const actionsValue = useMemo<IWizardActions<StepId>>(
    () => ({
      goToNextStep,
      goToPrevStep,
      goToStep,
      setStepData: setStepData as (stepId: StepId, data: unknown) => void,
      handleStepChange,
      validateStep: (sid: StepId) =>
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

export function useWizardState<
  T = unknown,
  StepId extends string = string,
>(): IWizardState<T, StepId> {
  const context = useContext(WizardStateContext);
  if (!context) {
    throw new Error("useWizardState must be used within a WizardProvider");
  }
  return context as IWizardState<T, StepId>;
}

export function useWizardValue<TValue = any>(
  path: string,
  options?: { isEqual?: (a: TValue, b: TValue) => boolean }
): TValue {
  const { store } = useWizardState();
  const lastStateRef = useRef<any>(null);
  const lastValueRef = useRef<any>(null);
  const isEqual = options?.isEqual || Object.is;

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    const data = fullState.data;
    if (data === lastStateRef.current) {
      return lastValueRef.current;
    }
    const value = getByPath(data, path) as TValue;

    // Memoization with custom equality
    if (
      lastValueRef.current !== undefined &&
      isEqual(lastValueRef.current, value)
    ) {
      lastStateRef.current = data;
      return lastValueRef.current;
    }

    lastStateRef.current = data;
    lastValueRef.current = value;
    return value;
  }, [store, path, isEqual]);

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
  selector: (state: any) => TSelected,
  options?: { isEqual?: (a: TSelected, b: TSelected) => boolean }
): TSelected {
  const { store } = useWizardState();
  const lastStateRef = useRef<any>(null);
  const lastResultRef = useRef<any>(null);
  const isEqual = options?.isEqual || Object.is;

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    if (fullState === lastStateRef.current) {
      return lastResultRef.current;
    }

    const result = selector(fullState.data);

    // Memoization with custom equality
    if (
      lastResultRef.current !== null &&
      isEqual(lastResultRef.current, result)
    ) {
      lastStateRef.current = fullState;
      return lastResultRef.current;
    }

    lastStateRef.current = fullState;
    lastResultRef.current = result;
    return result;
  }, [store, selector, isEqual]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardActions<
  StepId extends string = string,
>(): IWizardActions<StepId> {
  const context = useContext(WizardActionsContext);
  if (!context) {
    throw new Error("useWizardActions must be used within a WizardProvider");
  }
  return context as IWizardActions<StepId>;
}

export function useWizardContext<
  T = any,
  StepId extends string = string,
>(): IWizardContext<T, StepId> & {
  store: WizardStore<T>;
} {
  const state = useWizardState<T, StepId>();
  const actions = useWizardActions<StepId>();

  // Backward compatibility: subscribe to everything
  const wizardData = useWizardSelector<T>((s) => s as T);
  const allErrors = useSyncExternalStore(
    state.store.subscribe,
    () => state.store.getSnapshot().errors
  );

  return useMemo(
    () => ({
      ...state,
      ...actions,
      wizardData,
      allErrors,
    }),
    [state, actions, wizardData, allErrors]
  );
}
