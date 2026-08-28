import { getByPath, setByPath } from "../utils/data";
import type { 
  IWizardStore, 
  IWizardState, 
  WizardAction, 
  WizardMiddleware, 
  MiddlewareAPI 
} from "../types";

export class WizardStore<
  T,
  StepId extends string = string,
> implements IWizardStore<T, StepId> {
  private initialData: T;
  private dirtyFields = new Set<string>();
  private state: IWizardState<T, StepId>;
  private listeners = new Set<() => void>();
  private actionListeners = new Set<(action: WizardAction<T, StepId>) => void>();
  errorsMap = new Map<string, Map<string, string>>();
  private middlewareChain: (action: WizardAction<T, StepId>) => void;

  subscribeToActions(listener: (action: WizardAction<T, StepId>) => void) {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  private notifyActions(action: WizardAction<T, StepId>) {
    this.actionListeners.forEach((l) => l(action));
  }

  constructor(initialData: T, middlewares: WizardMiddleware<T, StepId>[] = []) {
    this.initialData = JSON.parse(JSON.stringify(initialData)); // Deep copy
    this.state = {
      data: initialData,
      errors: {},
      isDirty: false,
      dirtyFields: this.dirtyFields,
      visitedSteps: new Set(),
      completedSteps: new Set(),
      errorSteps: new Set(),
      currentStep: null,
      currentStepId: "",
      currentStepIndex: 0,
      isFirstStep: true,
      isLastStep: false,
      isLoading: true,
      isPending: false,
      isBusy: false,
      activeSteps: [],
      history: [],
      busySteps: new Set(),
      progress: 0,
      activeStepsCount: 0,
      breadcrumbs: [],
      config: {} as any, 
    };
    
    // Initialize middleware chain
    this.middlewareChain = this.setupMiddlewares(middlewares);
  }

  private setupMiddlewares(middlewares: WizardMiddleware<T, StepId>[]) {
    const middlewareAPI: MiddlewareAPI<T, StepId> = {
      getState: () => this.state.data,
      getSnapshot: () => this.getSnapshot(),
      dispatch: (action: WizardAction<T, StepId>) => this.dispatch(action),
    };

    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    
    // Compose middleware chain
    // Equivalent to redux compose: m1(m2(m3(internalDispatch)))
    return chain.reduceRight(
      (next, middleware) => middleware(next),
      this.internalDispatch.bind(this)
    );
  }

  /**
   * Public dispatch method to trigger actions through middleware
   */
  dispatch(action: WizardAction<T, StepId>) {
    this.middlewareChain(action);
  }

  /**
   * Internal dispatch that actually performs the state updates
   */
  private internalDispatch(action: WizardAction<T, StepId>) {
    this.notifyActions(action);
    switch (action.type) {
      case 'INIT': {
        this.initialData = JSON.parse(JSON.stringify(action.payload.data));
        const initialActiveSteps = action.payload.config.steps.filter((s: any) => !s.condition);
        this.state = {
          ...this.state,
          data: action.payload.data,
          config: action.payload.config,
          activeSteps: initialActiveSteps,
          activeStepsCount: initialActiveSteps.length,
        };
        this.notify();
        break;
      }
      case 'SET_CURRENT_STEP_ID':
        this.state = {
          ...this.state,
          currentStepId: action.payload.stepId,
        };
        this.notify();
        break;
      case 'SET_HISTORY':
        this.state = {
          ...this.state,
          history: action.payload.history,
        };
        this.notify();
        break;
      case 'SET_ACTIVE_STEPS':
        this.state = {
          ...this.state,
          activeSteps: action.payload.steps,
          activeStepsCount: action.payload.steps.length,
        };
        this.notify();
        break;
      case 'SET_DATA':
        this.updateDataByPath(action.payload.path, action.payload.value, action.payload.options);
        break;
      case 'UPDATE_DATA':
        this.updateBulkData(action.payload.data, action.payload.options);
        break;
      case 'GO_TO_STEP':
        this.state = {
          ...this.state,
          currentStepId: action.payload.to,
        };
        break;
      case 'VALIDATE_START':
        this.state.busySteps.add(action.payload.stepId);
        this.state = {
          ...this.state,
          busySteps: new Set(this.state.busySteps),
        };
        break;
      case 'VALIDATE_END':
        this.state.busySteps.delete(action.payload.stepId);
        this.state = {
            ...this.state,
            busySteps: new Set(this.state.busySteps)
        };
        // Deliberately does not write errors. The payload became a real
        // ValidationResult so that middleware and devtools see the truth, but
        // writing it here too would be a second error path: a slow adapter that
        // resolves after the user has already fixed the field would re-apply
        // its stale error map on top of the correction. validateStep owns the
        // writes.
        break;
      case 'SET_STEP_ERRORS':
        this.setStepErrors(action.payload.stepId, action.payload.errors);
        break;
      case 'RESET':
        this.setInitialData(action.payload.data);
        break;
      case 'SET_ERROR_STEPS':
        this.state = { ...this.state, errorSteps: action.payload.steps };
        break;
      case 'SET_VISITED_STEPS':
        this.state = { ...this.state, visitedSteps: action.payload.steps };
        break;
      case 'SET_COMPLETED_STEPS':
        this.state = { ...this.state, completedSteps: action.payload.steps };
        break;
    }
    this.syncDerivedState();
    this.notify();
  }

  // Refactor update methods to be called from internalDispatch
  private updateDataByPath(path: string, value: any, _options?: { debounceValidation?: number }) {
    const newData = setByPath(this.state.data as any, path, value);
    if (newData === this.state.data) return;
    this.update(newData as T, path);
  }

  private updateBulkData(data: Partial<T>, options?: { replace?: boolean }) {
    let newData: T;
    if (options?.replace) {
      newData = data as T;
    } else {
      // Shallow merge, not a JSON round-trip: the old deep clone destroyed
      // Date/Map/Set/undefined values that callers legitimately keep in state,
      // and bought nothing — only top-level keys are ever written here.
      newData = { ...(this.state.data as any), ...data };
    }
    this.update(newData, Object.keys(data));
  }

  getSnapshot = () => {
    return this.state;
  };

  update(newData: T, changedPath?: string | string[]) {
    if (changedPath) {
      const paths = Array.isArray(changedPath) ? changedPath : [changedPath];
      paths.forEach((path) => {
        const initialValue = getByPath(this.initialData, path);
        const newValue = getByPath(newData, path);

        if (JSON.stringify(initialValue) !== JSON.stringify(newValue)) {
          this.dirtyFields.add(path);
        } else {
          this.dirtyFields.delete(path);
        }
      });
    }

    this.state = {
      ...this.state,
      data: newData,
      isDirty: this.dirtyFields.size > 0,
      dirtyFields: new Set(this.dirtyFields),
    };
    this.notify();
  }

  updateMeta(newMeta: Partial<IWizardState<T, StepId>>) {
    this.state = {
      ...this.state,
      ...newMeta,
    };
    this.syncDerivedState();
    this.notify();
  }

  private syncDerivedState() {
    const { activeSteps, currentStepId, visitedSteps, completedSteps, errorSteps } = this.state;
    const currentStepIndex = Math.max(0, activeSteps.findIndex((s) => s.id === currentStepId));
    const currentStep = activeSteps[currentStepIndex] || null;

    const breadcrumbs = activeSteps.map((step) => {
      let status: "visited" | "completed" | "error" | "current" | "upcoming" = "upcoming";
      if (step.id === currentStepId) status = "current";
      else if (errorSteps.has(step.id)) status = "error";
      else if (completedSteps.has(step.id)) status = "completed";
      else if (visitedSteps.has(step.id)) status = "visited";

      return {
        id: step.id,
        label: step.label,
        status,
      };
    });

    this.state = {
      ...this.state,
      currentStep,
      currentStepIndex,
      isFirstStep: currentStepIndex === 0,
      isLastStep: activeSteps.length > 0 && currentStepIndex === activeSteps.length - 1,
      progress: activeSteps.length > 0 
        ? Math.round(((currentStepIndex + 1) / activeSteps.length) * 100) 
        : 0,
      breadcrumbs,
    };
  }

  setInitialData(data: T) {
    this.initialData = JSON.parse(JSON.stringify(data));
    this.dirtyFields.clear();
    this.state = {
      ...this.state,
      data,
      isDirty: false,
      dirtyFields: new Set(),
    };
    this.notify();
  }

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

  updateErrors(newErrors: Record<string, Record<string, string>>) {
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

  private notify() {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}
