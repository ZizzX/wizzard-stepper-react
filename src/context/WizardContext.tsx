import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useSyncExternalStore,
  useRef,
} from "react";
import type {
  IWizardConfig,
  IPersistenceAdapter,
  IStepConfig,
  IWizardContext,
} from "../types";
import { MemoryAdapter } from "../adapters/persistence/MemoryAdapter";
import { getByPath, setByPath } from "../utils/data";

export interface IWizardState<
  T extends Record<string, any> = Record<string, any>,
  StepId extends string = string,
> {
  currentStepId: StepId | "";
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

  // Data Access
  data: T;
  errors: Record<string, Record<string, string>>;

  store: WizardStore<T, StepId>;
}

// Optimization: Exclude data/errors from main subscription
export interface IWizardStructuralState<
  T extends Record<string, any> = Record<string, any>,
  StepId extends string = string,
> extends Omit<IWizardState<T, StepId>, "data" | "errors"> {}

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

// Advanced: Store for granular subscriptions and state management
export class WizardStore<
  T extends Record<string, any>,
  StepId extends string = string,
> {
  private internalState: {
    data: T;
    errors: Record<string, Record<string, string>>;
    currentStepId: StepId | "";
    visitedSteps: Set<StepId>;
    completedSteps: Set<StepId>;
    errorSteps: Set<StepId>;
    isLoading: boolean;
    isPending: boolean;
  };

  private config: IWizardConfig<T, StepId>;
  private stepsMap: Map<StepId, IStepConfig<any, T, StepId>>;
  private listeners = new Set<() => void>();

  // Caches for derived state
  private activeStepsCache: IStepConfig<any, T, StepId>[] = [];
  private activeStepsIndexMapCache: Map<StepId, number> = new Map();

  private snapshotCache: IWizardState<T, StepId> | null = null;
  private structuralSnapshotCache: IWizardStructuralState<T, StepId> | null =
    null;

  // Error Map for O(1) ops
  errorsMap = new Map<string, Map<string, string>>();

  constructor(config: IWizardConfig<T, StepId>, initialData: T) {
    this.config = config;
    this.stepsMap = new Map(config.steps.map((s) => [s.id, s]));

    this.internalState = {
      data: initialData,
      errors: {},
      currentStepId: "",
      visitedSteps: new Set(),
      completedSteps: new Set(),
      errorSteps: new Set(),
      isLoading: true,
      isPending: false,
    };

    // Initial calculation
    this.recomputeActiveSteps();
    this.updateSnapshot();
  }

  // --- Core State Updates ---

  update(newData: T) {
    if (this.internalState.data === newData) return;
    this.internalState.data = newData;
    this.recomputeActiveSteps(); // Data change might affect active steps
    this.updateSnapshot();
    this.notify();
  }

  updateErrors(newErrors: Record<string, Record<string, string>>) {
    this.internalState.errors = newErrors;
    // Sync map
    this.errorsMap.clear();
    for (const [stepId, fieldErrors] of Object.entries(newErrors)) {
      const stepMap = new Map<string, string>();
      for (const [field, msg] of Object.entries(fieldErrors)) {
        stepMap.set(field, msg);
      }
      if (stepMap.size > 0) this.errorsMap.set(stepId as string, stepMap);
    }
    this.updateSnapshot();
    this.notify();
  }

  // --- Helpers for Provider ---

  batch(callback: () => void) {
    callback();
  }

  getData(path: string, defaultValue?: any): any {
    if (!path) return this.internalState.data;
    return getByPath(this.internalState.data, path, defaultValue);
  }

  setData(path: string, value: any) {
    const { data } = this.internalState;
    const newData = setByPath(data, path, value);
    this.update(newData);
  }

  updateData(data: Partial<T>, replace?: boolean) {
    const { data: prevData } = this.internalState;
    const newData = replace ? (data as T) : { ...prevData, ...data };
    this.update(newData);
  }

  getErrors() {
    return this.internalState.errors;
  }

  clearErrors() {
    this.errorsMap.clear();
    this.internalState.errors = {};
    this.updateSnapshot();
    this.notify();
  }

  setState(partial: Partial<typeof this.internalState>) {
    Object.assign(this.internalState, partial);
    this.updateSnapshot();
    this.notify();
  }

  // --- Specific Setters (Optimization) ---

  setCurrentStepId(id: StepId | "") {
    if (this.internalState.currentStepId === id) return;
    this.internalState.currentStepId = id;
    this.updateSnapshot();
    this.notify();
  }

  setVisitedSteps(steps: Set<StepId>) {
    this.internalState.visitedSteps = steps;
    this.updateSnapshot();
    this.notify();
  }

  setCompletedSteps(steps: Set<StepId>) {
    this.internalState.completedSteps = steps;
    this.updateSnapshot();
    this.notify();
  }

  setErrorSteps(steps: Set<StepId>) {
    this.internalState.errorSteps = steps;
    this.updateSnapshot();
    this.notify();
  }

  setLoading(isLoading: boolean) {
    if (this.internalState.isLoading === isLoading) return;
    this.internalState.isLoading = isLoading;
    this.updateSnapshot();
    this.notify();
  }

  // --- Logic ---

  private recomputeActiveSteps() {
    const { data } = this.internalState;
    const nextActiveSteps = this.config.steps.filter((step) => {
      if (step.condition) {
        return step.condition(data);
      }
      return true;
    });

    // Structural equality check to avoid needless updates
    const prevIds = this.activeStepsCache.map((s) => s.id).join(".");
    const nextIds = nextActiveSteps.map((s) => s.id).join(".");

    if (prevIds !== nextIds || this.activeStepsCache.length === 0) {
      this.activeStepsCache = nextActiveSteps;
      this.activeStepsIndexMapCache.clear();
      nextActiveSteps.forEach((s, i) =>
        this.activeStepsIndexMapCache.set(s.id, i)
      );
    }
  }

  // Update Step Errors directly (O(1))
  setStepErrors(
    stepId: string,
    errors: Record<string, string> | undefined | null
  ) {
    if (!errors || Object.keys(errors).length === 0) {
      if (this.errorsMap.has(stepId)) {
        this.errorsMap.delete(stepId);
        this.syncErrors();
        return true;
      }
      return false;
    }

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
      this.syncErrors();
      return true;
    }
    return false;
  }

  private syncErrors() {
    const newErrorsObj: Record<string, Record<string, string>> = {};
    for (const [stepId, fieldErrors] of this.errorsMap.entries()) {
      if (fieldErrors.size > 0) {
        newErrorsObj[stepId] = Object.fromEntries(fieldErrors);
      }
    }
    this.internalState.errors = newErrorsObj;
    this.updateSnapshot();
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => {
    // Must be stable if nothing changed
    return this.snapshotCache!;
  };

  getStructuralSnapshot = () => {
    return this.structuralSnapshotCache!;
  };

  // Public Getters Helpers
  get activeSteps() {
    return this.activeStepsCache;
  }
  get stepsMapRef() {
    return this.stepsMap;
  }
  get activeStepsIndexMap() {
    return this.activeStepsIndexMapCache;
  }

  private updateSnapshot() {
    const {
      currentStepId,
      data,
      errors,
      isLoading,
      isPending,
      visitedSteps,
      completedSteps,
      errorSteps,
    } = this.internalState;

    const currentStep = currentStepId
      ? this.stepsMap.get(currentStepId) || null
      : null;
    const currentStepIndex = currentStepId
      ? (this.activeStepsIndexMapCache.get(currentStepId) ?? -1)
      : -1;

    this.snapshotCache = {
      currentStepId: (currentStepId || "") as StepId | "",
      currentStep,
      currentStepIndex,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === this.activeStepsCache.length - 1,
      isLoading,
      isPending,
      activeSteps: this.activeStepsCache,
      visitedSteps,
      completedSteps,
      errorSteps,
      data,
      errors,
      store: this as any,
    };

    // Optimization: Structural Snapshot (Reference Stable if structure matches)
    // We only create a new object if one of the structural fields changed.
    const newStructure: IWizardStructuralState<T, StepId> = {
      currentStepId: (currentStepId || "") as StepId | "",
      currentStep,
      currentStepIndex,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === this.activeStepsCache.length - 1,
      isLoading,
      isPending,
      activeSteps: this.activeStepsCache,
      visitedSteps,
      completedSteps,
      errorSteps,
      store: this as any,
    };

    if (
      !this.structuralSnapshotCache ||
      !this.isStructuralEqual(this.structuralSnapshotCache, newStructure)
    ) {
      this.structuralSnapshotCache = newStructure;
    }
  }

  private isStructuralEqual(
    a: IWizardStructuralState<T, StepId>,
    b: IWizardStructuralState<T, StepId>
  ) {
    return (
      a.currentStepId === b.currentStepId &&
      a.isLoading === b.isLoading &&
      a.isPending === b.isPending &&
      a.activeSteps === b.activeSteps &&
      a.visitedSteps === b.visitedSteps &&
      a.completedSteps === b.completedSteps &&
      a.errorSteps === b.errorSteps
    );
  }
}

const WizardStateContext = createContext<WizardStore<any, any> | undefined>(
  undefined
);
const WizardActionsContext = createContext<IWizardActions<any> | undefined>(
  undefined
);

// --- Provider ---

interface WizardProviderProps<T, StepId extends string> {
  config: IWizardConfig<T, StepId>;
  initialData?: T;
  initialStepId?: StepId;
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
  // Store initialization (stable)
  const storeRef = useRef<WizardStore<T, StepId>>(null as any);
  if (!storeRef.current) {
    storeRef.current = new WizardStore<T, StepId>(
      config,
      (initialData || {}) as T
    );
  }
  const store = storeRef.current;

  // Reactivity: Subscribe to the store
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  // Persistence Setup
  const persistenceAdapter = useMemo<IPersistenceAdapter>(() => {
    return config.persistence?.adapter || new MemoryAdapter();
  }, [config.persistence?.adapter]);

  const persistenceMode = config.persistence?.mode || "onStepChange";

  // State Refs for Actions (to avoid re-creating functions)
  // We use a ref to access the *latest* state inside actions without closure staleness
  const stateRef = useRef({
    config,
    persistenceMode,
    persistenceAdapter,
    state, // continuously updated
  });

  useEffect(() => {
    // Sync ref
    stateRef.current = { config, persistenceMode, persistenceAdapter, state };
  });

  // Constants
  const META_KEY = "__wizzard_meta__";

  // Hydration Helper
  const hydrate = useCallback(() => {
    store.setLoading(true);
    const { persistenceAdapter, config } = stateRef.current;

    const metaFn = persistenceAdapter.getStep<{
      currentStepId: string;
      visited: string[];
      completed: string[];
    }>(META_KEY);

    if (metaFn) {
      if (metaFn.currentStepId)
        store.setCurrentStepId(metaFn.currentStepId as StepId);
      if (metaFn.visited)
        store.setVisitedSteps(new Set(metaFn.visited as StepId[]));
      if (metaFn.completed)
        store.setCompletedSteps(new Set(metaFn.completed as StepId[]));
    }

    const loadedData: Partial<T> = {};
    config.steps.forEach((step) => {
      const stepData = persistenceAdapter.getStep(step.id);
      if (stepData) {
        Object.assign(loadedData, stepData);
      }
    });

    if (Object.keys(loadedData).length > 0) {
      store.updateData(loadedData);
    }
    store.setLoading(false);
  }, [store]);

  // Initial Step Logic
  useEffect(() => {
    const { currentStepId, activeSteps } = store.getSnapshot();
    if (!currentStepId && activeSteps.length > 0) {
      let targetId: StepId | undefined;
      if (initialStepId) {
        const target = activeSteps.find((s) => s.id === initialStepId);
        if (target) targetId = target.id;
      }
      if (!targetId) targetId = activeSteps[0].id;

      store.setCurrentStepId(targetId!);
      store.setLoading(false);
    } else {
      if (store.getSnapshot().isLoading) store.setLoading(false);
    }
  }, [store, initialStepId]);

  // Hydration Effect
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Save logic
  const save = useCallback(
    (stepIds?: StepId | StepId[] | boolean) => {
      const { persistenceAdapter, config } = stateRef.current;
      const { data, currentStepId, visitedSteps, completedSteps } =
        store.getSnapshot();

      // Save Meta
      persistenceAdapter.saveStep(META_KEY, {
        currentStepId,
        visited: Array.from(visitedSteps),
        completed: Array.from(completedSteps),
      });

      // Determine targets
      let targets: string[] = [];
      if (Array.isArray(stepIds)) targets = stepIds as string[];
      else if (typeof stepIds === "string") targets = [stepIds];
      else if (stepIds === true) targets = config.steps.map((s) => s.id);
      else if (currentStepId) targets = [currentStepId];

      // Write
      targets.forEach((id) => {
        if (id) persistenceAdapter.saveStep(id, data);
      });
    },
    [store]
  );

  // Persistence Effect (onChange)
  useEffect(() => {
    const { persistenceMode } = stateRef.current;
    if (persistenceMode === "onChange") {
      const timer = setTimeout(() => {
        save(true); // Save all steps on data change
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.data, save]);

  const clearStorage = useCallback(() => store.clearErrors(), [store]);

  // Validation
  const validateStep = useCallback(
    async (stepId: StepId, data: T): Promise<boolean> => {
      const { config } = stateRef.current;
      const step = config.steps.find((s) => s.id === stepId);
      if (!step || !step.validationAdapter) return true;

      const result = await step.validationAdapter.validate(data);

      store.setStepErrors(stepId, result.isValid ? null : result.errors);

      const { errorSteps } = store.getSnapshot();
      const nextErrorSteps = new Set(errorSteps);
      if (result.isValid) nextErrorSteps.delete(stepId);
      else nextErrorSteps.add(stepId);

      store.setErrorSteps(nextErrorSteps);

      return result.isValid;
    },
    [store]
  );

  const setData = useCallback(
    (path: string, value: any, _options?: { debounceValidation?: number }) => {
      store.setData(path, value);
    },
    [store]
  );

  const updateData = useCallback(
    (data: Partial<T>, options?: any) => {
      store.updateData(data, options?.replace);
    },
    [store]
  );

  const getData = useCallback(
    (path: string, def?: any) => {
      return store.getData(path, def);
    },
    [store]
  );

  const handleStepChange = useCallback(
    (field: string, value: any) => {
      store.setData(field, value);
    },
    [store]
  );

  const validateAll = useCallback(async () => {
    const { activeSteps } = store.getSnapshot();
    const data = store.getData("");

    const results = await Promise.all(
      activeSteps.map((s) => validateStep(s.id, data as T))
    );
    const isValid = results.every(Boolean);
    return { isValid, errors: store.getErrors() };
  }, [store, validateStep]);

  const goToStep = useCallback(
    async (stepId: StepId): Promise<boolean> => {
      const { state: snapshot, config } = stateRef.current;
      const { currentStepId, visitedSteps } = snapshot as any;
      const { activeStepsIndexMap } = store;

      if (!currentStepId) return false;

      const targetIndex = activeStepsIndexMap.get(stepId) ?? -1;
      const currentIndex = activeStepsIndexMap.get(currentStepId) ?? -1;

      if (targetIndex === -1) return false;

      const currentData = store.getData("") as T;

      if (targetIndex > currentIndex) {
        const currentStep = config.steps.find((s) => s.id === currentStepId);
        const shouldValidate =
          currentStep?.autoValidate ?? config.autoValidate ?? false;
        const mode =
          currentStep?.validationMode ||
          config.validationMode ||
          "onStepChange";

        if (shouldValidate || mode === "onStepChange") {
          const isValid = await validateStep(currentStepId, currentData);
          if (!isValid) return false;
        }
      }

      const nextVisited = new Set<StepId>(visitedSteps as Set<StepId>);
      nextVisited.add(currentStepId);

      // Persistence onStepChange
      const { persistenceMode } = stateRef.current;
      if (persistenceMode === "onStepChange") {
        save(currentStepId);
      }

      store.batch(() => {
        store.setVisitedSteps(nextVisited);
        store.setCurrentStepId(stepId);
      });

      window.scrollTo(0, 0);
      return true;
    },
    [store, validateStep]
  );

  const goToNextStep = useCallback(async () => {
    const { activeSteps, currentStepIndex } = store.getSnapshot();
    if (currentStepIndex >= activeSteps.length - 1) return;
    const next = activeSteps[currentStepIndex + 1];
    if (next) await goToStep(next.id);
  }, [goToStep, store]);

  const goToPrevStep = useCallback(() => {
    const { activeSteps, currentStepIndex } = store.getSnapshot();
    if (currentStepIndex <= 0) return;
    const prev = activeSteps[currentStepIndex - 1];
    if (prev) goToStep(prev.id);
  }, [goToStep, store]);

  const actionsValue = useMemo(
    () => ({
      goToNextStep,
      goToPrevStep,
      goToStep,
      setStepData: (_id: any, _d: any) => {},
      handleStepChange,
      validateStep,
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
    <WizardStateContext.Provider value={store as any}>
      <WizardActionsContext.Provider value={actionsValue as any}>
        {children}
      </WizardActionsContext.Provider>
    </WizardStateContext.Provider>
  );
}

function useWizardStore<
  T extends Record<string, any> = Record<string, any>,
  StepId extends string = string,
>() {
  const store = useContext(WizardStateContext);
  if (!store) {
    throw new Error("useWizardState must be used within a WizardProvider");
  }
  return store as unknown as WizardStore<T, StepId>;
}

export function useWizardState<
  T extends Record<string, any> = Record<string, any>,
  StepId extends string = string,
>(): IWizardState<T, StepId> {
  const store = useWizardStore<T, StepId>();
  // Use structural snapshot to prevent re-renders on data change
  const structuralState = useSyncExternalStore(
    store.subscribe,
    store.getStructuralSnapshot
  );

  // We cast back to IWizardState mostly for compatibility,
  // but consumers should prefer useWizardValue for data.
  // This effectively hides 'data' from triggering re-renders here.
  return structuralState as unknown as IWizardState<T, StepId>;
}

export function useWizardValue<TValue = any>(
  path: string,
  options?: { isEqual?: (a: TValue, b: TValue) => boolean }
): TValue {
  const store = useWizardStore();
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
  const store = useWizardStore();
  const lastStateRef = useRef<any>(null);
  const lastValueRef = useRef<any>(null);

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    const errors = fullState.errors;
    if (errors === lastStateRef.current) {
      return lastValueRef.current;
    }

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
  const store = useWizardStore();
  const lastStateRef = useRef<any>(null);
  const lastResultRef = useRef<any>(null);
  const isEqual = options?.isEqual || Object.is;

  const getSnapshot = useCallback(() => {
    const fullState = store.getSnapshot();
    if (fullState === lastStateRef.current) {
      return lastResultRef.current;
    }

    const result = selector(fullState.data);

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
  T extends Record<string, any> = Record<string, any>,
  StepId extends string = string,
>(): IWizardContext<T, StepId> & {
  store: WizardStore<T, StepId>;
} {
  const state = useWizardState<T, StepId>();
  const actions = useWizardActions<StepId>();

  const wizardData = useWizardSelector<T>((s) => s as T);
  const allErrors = useSyncExternalStore(
    state.store.subscribe,
    () => state.store.getSnapshot().errors
  );

  return useMemo(
    () =>
      ({
        ...state,
        ...actions,
        wizardData,
        allErrors,
      }) as unknown as IWizardContext<T, StepId> & {
        store: WizardStore<T, StepId>;
      },
    [state, actions, wizardData, allErrors]
  );
}
