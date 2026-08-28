import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useSyncExternalStore,
  useRef,
} from "react";
import type {
  IWizardConfig,
  PersistenceMode,
  IPersistenceAdapter,
  IStepConfig,
  IWizardContext,
  IWizardState,
  IWizardActions,
  IWizardStore,
  WizardEventHandler,
  ValidationResult,
} from "../types";
import { WizardStore } from "../store/WizardStore";
import { MemoryAdapter } from "../adapters/persistence/MemoryAdapter";
import { getByPath, setByPath, shallowEqual, toPath } from "../utils/data";

const WizardStateContext = createContext<IWizardState<any, any> | undefined>(
  undefined
);
const WizardActionsContext = createContext<IWizardActions<any> | undefined>(
  undefined
);
const WizardStoreContext = createContext<IWizardStore<any, any> | undefined>(
  undefined
);

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
  // 1. Core State & Config
  const [localConfig, setLocalConfig] =
    useState<IWizardConfig<T, StepId>>(config);

  // 2. Store & Persistence
  const storeRef = useRef<WizardStore<T, StepId>>(
    null as unknown as WizardStore<T, StepId>
  );
  if (!storeRef.current) {
    storeRef.current = new WizardStore<T, StepId>(
      (initialData || {}) as T,
      config.middlewares
    );
  }

  const isInitialized = useRef(false);
  // Read through a ref so an inline `initialData` literal cannot churn the
  // identity of the actions context on every parent render. Kept in sync below,
  // so `reset()` restores the data the consumer currently considers initial -
  // the async-defaults pattern (render a placeholder, then supply fetched
  // values) depends on that.
  const initialDataRef = useRef(initialData);
  const lastConfigPropRef = useRef(config);
  // Bumped whenever the user edits a step, so a validation that resolves after
  // an edit can tell that its verdict is out of date.
  const editEpochRef = useRef<Map<StepId, number>>(new Map());
  // Which persistence adapter we have already hydrated from. Keyed by identity
  // rather than a plain boolean so swapping the adapter at runtime re-hydrates.
  const hydratedFromRef = useRef<IPersistenceAdapter | null>(null);

  const persistenceAdapter = useMemo<IPersistenceAdapter>(() => {
    return localConfig.persistence?.adapter || new MemoryAdapter();
  }, [localConfig.persistence?.adapter]);

  const persistenceMode = localConfig.persistence?.mode || "onStepChange";
  const META_KEY = "__wizzard_meta__";

  // 3. Reactive Store Values (Subscription)
  const snapshot = useSyncExternalStore(
    (l) => storeRef.current.subscribe(l),
    () => storeRef.current.getSnapshot()
  );

  const {
    activeSteps,
    currentStepId,
    history,
    visitedSteps,
    completedSteps,
    data: wizardData,
  } = snapshot;

  // 4. Stable Helpers (Mapping)
  const stepsMap = useMemo(() => {
    const map = new Map<StepId, IStepConfig<T, StepId>>();
    localConfig.steps.forEach((step: IStepConfig<T, StepId>) =>
      map.set(step.id, step)
    );
    return map;
  }, [localConfig.steps]);

  // Consumers commonly wrap a hoisted steps array in an inline
  // `config={{ steps }}` literal, which has a fresh identity on every parent
  // render. Bail out when the fields are unchanged, otherwise each parent render
  // re-creates stepsMap and re-runs the (possibly async) condition resolution.
  // A config whose `steps` array is itself rebuilt inline every render cannot be
  // recognised this way and still re-seeds; comparing step objects deeply is not
  // worth it.
  useEffect(() => {
    // Compare against the last prop we saw, not against localConfig:
    // `updateConfig()` merges into localConfig, and comparing with that would
    // treat the merge as a difference and revert it on the next parent render.
    if (shallowEqual(lastConfigPropRef.current, config)) return;
    lastConfigPropRef.current = config;
    setLocalConfig(config);
  }, [config]);

  // Directional navigation requires some indexes
  const activeStepsIndexMap = useMemo(() => {
    const map = new Map<StepId, number>();
    activeSteps.forEach((s: IStepConfig<T, StepId>, i: number) =>
      map.set(s.id, i)
    );
    return map;
  }, [activeSteps]);

  // 5. Actions Reference (Stable)
  const stateRef = useRef({
    config: localConfig,
    stepsMap,
    activeSteps,
    activeStepsIndexMap,
    visitedSteps,
    completedSteps,
    persistenceMode,
    persistenceAdapter,
    currentStepId,
    history,
  });

  // Condition Memoization Cache
  const conditionCacheRef = useRef<
    Map<StepId, { result: boolean; depsValues: any[] }>
  >(new Map());

  // Validation Debounce Timers, keyed by step id. One shared timer would let an
  // edit on one step cancel a validation still pending for another.
  const validationDebounceRef = useRef<
    Map<StepId, ReturnType<typeof setTimeout>>
  >(new Map());

  useEffect(() => {
    stateRef.current = {
      config: localConfig,
      stepsMap,
      activeSteps,
      activeStepsIndexMap,
      visitedSteps,
      completedSteps,
      persistenceMode,
      persistenceAdapter,
      currentStepId,
      history,
    };
  });

  useEffect(() => {
    initialDataRef.current = initialData;
  });

  // Cleanup Debounce
  useEffect(() => {
    const timers = validationDebounceRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // Analytics
  const trackEvent = useCallback<WizardEventHandler<StepId>>(
    (name, payload) => {
      localConfig.analytics?.onEvent(name, payload as any);
    },
    [localConfig.analytics]
  );

  // Persistence Save
  const saveData = useCallback(
    (mode: PersistenceMode, stepId: StepId, data: any) => {
      const {
        stepsMap,
        persistenceAdapter,
        persistenceMode: globalMode,
      } = stateRef.current;
      const stepConfig = stepsMap.get(stepId);
      const adapterToUse = stepConfig?.persistenceAdapter || persistenceAdapter;
      const modeToUse = stepConfig?.persistenceMode || globalMode;

      if (mode === modeToUse || mode === "manual") {
        adapterToUse.saveStep(stepId, data);
      }
    },
    []
  );

  // `saveData` routes writes to `step.persistenceAdapter || persistenceAdapter`,
  // so clearing only the global one leaves per-step adapters holding data - and
  // for a LocalStorageAdapter with its own prefix, data no clear the library
  // performs can ever reach. Clear every distinct adapter that could have been
  // written to.
  const clearAllStorage = useCallback(() => {
    const { persistenceAdapter: globalAdapter, stepsMap: steps } =
      stateRef.current;
    const adapters = new Set<IPersistenceAdapter>([globalAdapter]);
    steps.forEach((step) => {
      if (step.persistenceAdapter) adapters.add(step.persistenceAdapter);
    });
    adapters.forEach((a) => a.clear());
  }, []);

  // Navigation meta is persisted from a fresh snapshot by every path that
  // changes it. Writing it only inside goToStep left the stored `completed` set
  // one step behind - goToNextStep marks the step it just left as completed
  // *after* goToStep returns - and left dependsOn invalidation unrecorded, so a
  // reload resurrected steps whose prerequisite data had changed.
  const persistNavigationMeta = useCallback(() => {
    const { persistenceMode: mode, persistenceAdapter: adapter } =
      stateRef.current;
    if (mode === "manual") return;
    const snap = storeRef.current.getSnapshot();
    if (!snap.currentStepId) return;
    adapter.saveStep(META_KEY, {
      currentStepId: snap.currentStepId,
      visited: Array.from(snap.visitedSteps),
      completed: Array.from(snap.completedSteps),
      history: snap.history,
    });
  }, []);

  // 6. Action Implementations
  const resolveActiveStepsHelper = useCallback(
    async (data: T): Promise<IStepConfig<T, StepId>[]> => {
      storeRef.current.updateMeta({ isBusy: true });
      try {
        const results = await Promise.all(
          localConfig.steps.map(async (step) => {
            if (!step.condition) return { step, ok: true };

            // Optimization: Memoized Condition Resolution
            if (step.conditionDependsOn) {
              const currentDepsValues = step.conditionDependsOn.map((path) =>
                getByPath(data, path)
              );
              const cached = conditionCacheRef.current.get(step.id);

              if (
                cached &&
                cached.depsValues.length === currentDepsValues.length &&
                cached.depsValues.every(
                  (val, idx) => val === currentDepsValues[idx]
                )
              ) {
                return { step, ok: cached.result };
              }

              // If not cached or deps changed, resolve and cache
              try {
                const res = step.condition(
                  data || {},
                  storeRef.current.getSnapshot()
                );
                const ok = res instanceof Promise ? await res : res;
                conditionCacheRef.current.set(step.id, {
                  result: ok,
                  depsValues: currentDepsValues,
                });
                return { step, ok };
              } catch (e) {
                console.error(`[Wizard] Condition failed for ${step.id}:`, e);
                return { step, ok: false };
              }
            }

            // Fallback: Default behavior (always resolve if no deps specified)
            const nextBusyStart = new Set(
              storeRef.current.getSnapshot().busySteps
            );
            nextBusyStart.add(step.id as StepId);
            storeRef.current.updateMeta({
              busySteps: nextBusyStart,
              isBusy: true,
            });

            try {
              const res = step.condition(
                data || {},
                storeRef.current.getSnapshot()
              );
              const ok = res instanceof Promise ? await res : res;
              return { step, ok };
            } catch (e) {
              console.error(`[Wizard] Condition failed for ${step.id}:`, e);
              return { step, ok: false };
            } finally {
              const currentSnapshot = storeRef.current.getSnapshot();
              const nextBusyEnd = new Set(currentSnapshot.busySteps);
              nextBusyEnd.delete(step.id as StepId);
              storeRef.current.updateMeta({
                busySteps: nextBusyEnd,
                isBusy: nextBusyEnd.size > 0,
              });
            }
          })
        );
        return results.filter((r) => r.ok).map((r) => r.step) as IStepConfig<
          T,
          StepId
        >[];
      } finally {
        const currentSnapshot = storeRef.current.getSnapshot();
        if (currentSnapshot.busySteps.size === 0) {
          storeRef.current.updateMeta({ isBusy: false });
        }
      }
    },
    [localConfig.steps]
  );

  const validateStep = useCallback(
    async (stepId: StepId, data: T): Promise<boolean> => {
      const step = stepsMap.get(stepId);
      if (!step || !step.validationAdapter) return true;

      const epoch = editEpochRef.current.get(stepId) ?? 0;

      storeRef.current.dispatch({
        type: "VALIDATE_START",
        payload: { stepId },
      });
      const nextBusy = new Set(storeRef.current.getSnapshot().busySteps);
      nextBusy.add(stepId);
      storeRef.current.updateMeta({ busySteps: nextBusy, isBusy: true });

      // Reported in `finally` so the action stream and any middleware see the
      // real outcome. Errors themselves are written on the paths below, not by
      // the reducer: a throwing adapter leaves this initializer in place, and
      // wiping the user's error messages on a crash would be worse than keeping
      // them.
      let result: ValidationResult = { isValid: false };

      try {
        result = await step.validationAdapter.validate(data);

        // A verdict describes the step's data as it was when validation
        // started. If the user edited that step while an async adapter was in
        // flight - fixing the very field that was invalid, say - writing the
        // verdict now would resurrect an error they already cleared. Report it,
        // record nothing.
        if ((editEpochRef.current.get(stepId) ?? 0) !== epoch) {
          return result.isValid;
        }

        if (result.isValid) {
          storeRef.current.setStepErrors(stepId, null);
          const nextErrorSteps = new Set(
            storeRef.current.getSnapshot().errorSteps
          );
          nextErrorSteps.delete(stepId);
          storeRef.current.dispatch({
            type: "SET_ERROR_STEPS",
            payload: { steps: nextErrorSteps },
          });
          return true;
        } else {
          storeRef.current.setStepErrors(stepId, result.errors || null);
          trackEvent("validation_error", {
            stepId,
            errors: result.errors,
            timestamp: Date.now(),
          });
          const nextErrorSteps = new Set(
            storeRef.current.getSnapshot().errorSteps
          );
          nextErrorSteps.add(stepId);
          storeRef.current.dispatch({
            type: "SET_ERROR_STEPS",
            payload: { steps: nextErrorSteps },
          });

          // Ensure it's removed from completed if it has errors
          const nextCompleted = new Set(
            storeRef.current.getSnapshot().completedSteps
          );
          if (nextCompleted.has(stepId)) {
            nextCompleted.delete(stepId);
            storeRef.current.dispatch({
              type: "SET_COMPLETED_STEPS",
              payload: { steps: nextCompleted },
            });
          }

          return false;
        }
      } finally {
        const nextBusyAfter = new Set(storeRef.current.getSnapshot().busySteps);
        nextBusyAfter.delete(stepId);
        storeRef.current.updateMeta({
          busySteps: nextBusyAfter,
          isBusy: nextBusyAfter.size > 0,
        });
        storeRef.current.dispatch({
          type: "VALIDATE_END",
          payload: { stepId, result },
        });
      }
    },
    [stepsMap, trackEvent]
  );

  const goToStep = useCallback(
    async (
      stepId: StepId,
      providedActiveSteps?: IStepConfig<T, StepId>[],
      options: { validate?: boolean } = { validate: true }
    ): Promise<boolean> => {
      const { currentStepId, config, persistenceMode, stepsMap } =
        stateRef.current;
      const currentData = storeRef.current.getSnapshot().data;

      // Directions & Validation
      const allSteps = config.steps;
      const currentIdx = allSteps.findIndex((s) => s.id === currentStepId);
      const targetIdx = allSteps.findIndex((s) => s.id === stepId);

      if (targetIdx > currentIdx && currentStepId && options.validate) {
        const step = stepsMap.get(currentStepId as StepId);
        const shouldVal =
          step?.autoValidate ??
          config.autoValidate ??
          !!step?.validationAdapter;
        if (shouldVal) {
          const ok = await validateStep(currentStepId as StepId, currentData);
          if (!ok) return false;
        }
      }

      storeRef.current.updateMeta({ isBusy: true });
      try {
        const resolvedSteps =
          providedActiveSteps || (await resolveActiveStepsHelper(currentData));
        const target = resolvedSteps.find((s) => s.id === stepId);
        if (!target) return false;

        const step = stepsMap.get(currentStepId as StepId);
        if (step?.beforeLeave) {
          const snapshot = storeRef.current.getSnapshot();
          const direction = targetIdx > currentIdx ? "next" : "prev";
          const ok = await step.beforeLeave(currentData, direction, snapshot);
          if (ok === false) return false;
        }

        if (
          currentStepId &&
          (step?.persistenceMode || persistenceMode) === "onStepChange"
        ) {
          saveData("onStepChange", currentStepId as StepId, currentData);
        }

        const currentSnapshot = storeRef.current.getSnapshot();
        const nextVisited = new Set(currentSnapshot.visitedSteps);
        // Mark previous step as visited
        if (currentStepId) nextVisited.add(currentStepId as StepId);
        // Mark new step as visited (on entry)
        nextVisited.add(stepId);

        storeRef.current.dispatch({
          type: "SET_VISITED_STEPS",
          payload: { steps: nextVisited },
        });

        storeRef.current.dispatch({
          type: "SET_CURRENT_STEP_ID",
          payload: { stepId },
        });

        const nextHistory = [...currentSnapshot.history, stepId];
        storeRef.current.dispatch({
          type: "SET_HISTORY",
          payload: { history: nextHistory },
        });

        persistNavigationMeta();

        if (config.onStepChange)
          config.onStepChange(currentStepId || null, stepId, currentData);
        trackEvent("step_change", {
          from: (currentStepId || null) as any,
          to: stepId,
          timestamp: Date.now(),
        });
        if (typeof window !== "undefined") window.scrollTo(0, 0);
        return true;
      } finally {
        storeRef.current.updateMeta({ isBusy: false });
      }
    },
    [
      resolveActiveStepsHelper,
      validateStep,
      saveData,
      trackEvent,
      persistNavigationMeta,
    ]
  );

  const goToNextStep = useCallback(async () => {
    const { currentStepId } = stateRef.current;
    if (!currentStepId) return;

    const currentData = storeRef.current.getSnapshot().data;
    const step = stepsMap.get(currentStepId as StepId);

    // 1. Validate CURRENT step first
    const shouldVal =
      step?.autoValidate ??
      localConfig.autoValidate ??
      !!step?.validationAdapter;
    if (shouldVal) {
      const ok = await validateStep(currentStepId as StepId, currentData);
      if (!ok) return;
    }

    // 2. Resolve active steps ONLY if validation passed
    const resolvedSteps = await resolveActiveStepsHelper(currentData);
    const idx = resolvedSteps.findIndex((s) => s.id === currentStepId);

    if (idx !== -1 && idx < resolvedSteps.length - 1) {
      const nextStepId = resolvedSteps[idx + 1].id;
      // Pass { validate: false } because we ALREADY validated above
      const success = await goToStep(nextStepId, resolvedSteps, {
        validate: false,
      });
      if (success) {
        // Logic: Mark as completed ONLY if validation passed (already checked above)
        // AND no current errors for this step.
        const currentSnapshot = storeRef.current.getSnapshot();
        if (!currentSnapshot.errorSteps.has(currentStepId as StepId)) {
          const nextComp = new Set(currentSnapshot.completedSteps);
          nextComp.add(currentStepId as StepId);
          storeRef.current.dispatch({
            type: "SET_COMPLETED_STEPS",
            payload: { steps: nextComp },
          });
          persistNavigationMeta();
        }
      }
    }
  }, [
    goToStep,
    resolveActiveStepsHelper,
    validateStep,
    stepsMap,
    localConfig.autoValidate,
    persistNavigationMeta,
  ]);

  const goToPrevStep = useCallback(() => {
    const { currentStepId, activeSteps, activeStepsIndexMap } =
      stateRef.current;
    const idx = activeStepsIndexMap.get(currentStepId as StepId) ?? -1;
    if (idx > 0) goToStep(activeSteps[idx - 1].id);
  }, [goToStep]);

  const setData = useCallback(
    (path: string, value: any, options?: { debounceValidation?: number }) => {
      const { persistenceMode, stepsMap, currentStepId } = stateRef.current;
      const prevData = storeRef.current.getSnapshot().data;
      if (getByPath(prevData, path) === value) return;

      storeRef.current.dispatch({
        type: "SET_DATA",
        payload: { path, value, options },
      });

      // Auto-invalidation. Data mutations go through dispatch so the store stays
      // the single source of truth and middleware sees them. The visited /
      // completed sets are collected first and dispatched once each, instead of
      // once per affected step, so a keystroke does not fan out into a burst of
      // notifications.
      const changedKeys = toPath(path);
      const dependsOnChanged = (deps?: string[]) =>
        !!deps?.some((p) => {
          // Compare parsed segments so that bracket notation matches: a step
          // declaring `items` must react to `items[0].name`.
          // Overlap in either direction counts. Writing `user.country`
          // changes a step that depends on `user`, and replacing `user`
          // wholesale changes a step that depends on `user.country`.
          const depKeys = toPath(p);
          const shared = Math.min(changedKeys.length, depKeys.length);
          for (let i = 0; i < shared; i++) {
            if (changedKeys[i] !== depKeys[i]) return false;
          }
          return shared > 0;
        });

      const affected = localConfig.steps.filter((step) =>
        dependsOnChanged(step.dependsOn)
      );

      if (affected.length) {
        const snapshot = storeRef.current.getSnapshot();

        const nextComp = new Set(snapshot.completedSteps);
        const nextVis = new Set(snapshot.visitedSteps);
        let compChanged = false;
        let visChanged = false;
        affected.forEach((step) => {
          if (nextComp.delete(step.id as StepId)) compChanged = true;
          if (nextVis.delete(step.id as StepId)) visChanged = true;
        });
        if (compChanged) {
          storeRef.current.dispatch({
            type: "SET_COMPLETED_STEPS",
            payload: { steps: nextComp },
          });
        }
        if (visChanged) {
          storeRef.current.dispatch({
            type: "SET_VISITED_STEPS",
            payload: { steps: nextVis },
          });
        }
        if (compChanged || visChanged) persistNavigationMeta();

        affected.forEach((step) => {
          if (!step.clearData) return;

          if (typeof step.clearData === "function") {
            storeRef.current.dispatch({
              type: "UPDATE_DATA",
              payload: {
                data: step.clearData(storeRef.current.getSnapshot().data),
              },
            });
            return;
          }

          const paths = Array.isArray(step.clearData)
            ? step.clearData
            : [step.clearData];
          const current = storeRef.current.getSnapshot().data;
          const toClear = paths.filter(
            (p) => getByPath(current, p as string) !== undefined
          );
          if (!toClear.length) return;

          // One dispatch, not one per path: each SET_DATA runs a full
          // syncDerivedState + notify over every subscriber, and this sits on
          // the keystroke path.
          let cleared = current;
          toClear.forEach((p) => {
            cleared = setByPath(cleared as any, p as string, undefined);
          });
          storeRef.current.dispatch({
            type: "UPDATE_DATA",
            payload: { data: cleared as any, options: { replace: true } },
          });
        });
      }

      // Read back the committed data: validation and persistence must see the
      // same state the store holds, cleared paths included.
      const newData = storeRef.current.getSnapshot().data;

      if (currentStepId) {
        const stepKey = currentStepId as StepId;
        editEpochRef.current.set(
          stepKey,
          (editEpochRef.current.get(stepKey) ?? 0) + 1
        );
        storeRef.current.deleteError(currentStepId, path);
        const step = stepsMap.get(currentStepId as StepId);
        if (
          (step?.validationMode ||
            localConfig.validationMode ||
            "onStepChange") === "onChange"
        ) {
          const debounceMs =
            options?.debounceValidation ??
            localConfig.validationDebounceTime ??
            300;

          const stepId = currentStepId as StepId;
          const timers = validationDebounceRef.current;
          const pending = timers.get(stepId);
          if (pending) clearTimeout(pending);

          timers.set(
            stepId,
            setTimeout(() => {
              timers.delete(stepId);
              validateStep(stepId, newData);
            }, debounceMs)
          );
        }
        if ((step?.persistenceMode || persistenceMode) === "onChange") {
          saveData("onChange", currentStepId as StepId, newData);
        }
      }
    },
    [localConfig, validateStep, saveData, persistNavigationMeta]
  );

  const updateData = useCallback(
    (data: Partial<T>, options?: { replace?: boolean; persist?: boolean }) => {
      const prev = storeRef.current.getSnapshot().data;
      const next = options?.replace ? (data as T) : { ...prev, ...data };
      storeRef.current.update(next, Object.keys(data));
      if (options?.persist) {
        localConfig.steps.forEach((s) => saveData("manual", s.id, next));
      }
    },
    [localConfig.steps, saveData]
  );

  const reset = useCallback(() => {
    // Drop queued onChange validations: their closures hold pre-reset data and
    // would write the old errors back onto a wizard that was just cleared.
    validationDebounceRef.current.forEach((timer) => clearTimeout(timer));
    validationDebounceRef.current.clear();

    storeRef.current.setInitialData(initialDataRef.current || ({} as T));
    storeRef.current.update((initialDataRef.current || {}) as T);
    storeRef.current.updateErrors({});
    storeRef.current.dispatch({
      type: "SET_VISITED_STEPS",
      payload: { steps: new Set() },
    });
    storeRef.current.dispatch({
      type: "SET_COMPLETED_STEPS",
      payload: { steps: new Set() },
    });
    storeRef.current.dispatch({
      type: "SET_ERROR_STEPS",
      payload: { steps: new Set() },
    });
    if (activeSteps.length > 0) {
      const startId = activeSteps[0].id;
      storeRef.current.dispatch({
        type: "SET_CURRENT_STEP_ID",
        payload: { stepId: startId },
      });
      storeRef.current.dispatch({
        type: "SET_HISTORY",
        payload: { history: [startId] },
      });
    } else {
      storeRef.current.dispatch({
        type: "SET_CURRENT_STEP_ID",
        payload: { stepId: "" },
      });
      storeRef.current.dispatch({
        type: "SET_HISTORY",
        payload: { history: [] },
      });
    }
    clearAllStorage();
    trackEvent("wizard_reset", { data: initialDataRef.current } as any);
  }, [activeSteps, trackEvent, clearAllStorage]);

  // 7. Context Values
  const stateValue = useMemo<IWizardState<T, StepId>>(
    () => ({
      ...snapshot,
      config: localConfig,
    }),
    [snapshot, localConfig]
  );

  const actionsValue = useMemo<IWizardActions<StepId>>(
    () => ({
      goToNextStep,
      goToPrevStep,
      goToStep,
      setStepData: (_stepId: StepId, data: any) => {
        const next = { ...storeRef.current.getSnapshot().data, ...data };
        storeRef.current.update(next, Object.keys(data));
      },
      handleStepChange: (f: string, v: any) => {
        if (stateRef.current.currentStepId) setData(f, v);
      },
      validateStep: (sid: StepId) =>
        validateStep(sid, storeRef.current.getSnapshot().data),
      validateAll: async () => {
        storeRef.current.updateMeta({ isBusy: true });
        const data = storeRef.current.getSnapshot().data;
        const active = await resolveActiveStepsHelper(data);
        const results = await Promise.all(
          active.map((s) => validateStep(s.id, data))
        );
        storeRef.current.updateMeta({ isBusy: false });
        return {
          isValid: results.every(Boolean),
          errors: storeRef.current.getSnapshot().errors,
        };
      },
      save: (ids?: StepId | StepId[] | boolean) => {
        const data = storeRef.current.getSnapshot().data;
        if (ids === true)
          localConfig.steps.forEach((s) =>
            saveData("manual", s.id as StepId, data)
          );
        else if (!ids) {
          if (stateRef.current.currentStepId)
            saveData("manual", stateRef.current.currentStepId as StepId, data);
        } else
          (Array.isArray(ids) ? ids : [ids]).forEach((id) =>
            saveData("manual", id as StepId, data)
          );
      },
      clearStorage: clearAllStorage,
      reset,
      setData,
      updateData,
      getData: (p: string, d?: any) =>
        getByPath(storeRef.current.getSnapshot().data, p, d),
      updateConfig: (nc: any) => setLocalConfig((prev) => ({ ...prev, ...nc })),
    }),
    [
      goToNextStep,
      goToPrevStep,
      goToStep,
      validateStep,
      reset,
      setData,
      updateData,
      localConfig.steps,
      saveData,
      resolveActiveStepsHelper,
      clearAllStorage,
    ]
  );

  // 8. Lifecycle & Initialization
  // `initialData` is read from the ref: an inline object literal would otherwise
  // re-run this effect (and notify every subscriber through updateMeta) on every
  // parent render.
  useEffect(() => {
    if (!isInitialized.current) {
      storeRef.current.dispatch({
        type: "INIT",
        payload: { data: initialDataRef.current || ({} as T), config: localConfig },
      });
      isInitialized.current = true;
    } else {
      // Sync config if it changes, but don't reset data
      storeRef.current.updateMeta({ config: localConfig });
    }
  }, [localConfig]);

  // Handle Dynamic Steps Resolution (Debounced)
  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      const resolved = await resolveActiveStepsHelper(wizardData);
      if (isMounted) {
        storeRef.current.dispatch({
          type: "SET_ACTIVE_STEPS",
          payload: { steps: resolved },
        });
      }
    }, 200); // 200ms debounce

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [wizardData, resolveActiveStepsHelper]);

  // Initial Step Selection and Hydration
  useEffect(() => {
    // Hydration replays a stored snapshot of the navigation meta, so it must
    // happen exactly once. This effect re-runs whenever `activeSteps` gets a
    // new identity (the debounced condition resolution hands it a fresh array
    // on every data change); replaying then would overwrite live state — most
    // visibly undoing the visited/completed invalidation that `dependsOn`
    // performs on `setData`.
    const isNewAdapter = hydratedFromRef.current !== persistenceAdapter;
    hydratedFromRef.current = persistenceAdapter;
    const meta = isNewAdapter
      ? persistenceAdapter.getStep<{
          currentStepId: string;
          visited: string[];
          completed: string[];
          history: string[];
        }>(META_KEY)
      : undefined;
    if (meta) {
      if (meta.currentStepId) {
        storeRef.current.dispatch({
          type: "SET_CURRENT_STEP_ID",
          payload: { stepId: meta.currentStepId as StepId },
        });
      }
      if (meta.visited)
        storeRef.current.dispatch({
          type: "SET_VISITED_STEPS",
          payload: { steps: new Set(meta.visited as StepId[]) },
        });
      if (meta.completed)
        storeRef.current.dispatch({
          type: "SET_COMPLETED_STEPS",
          payload: { steps: new Set(meta.completed as StepId[]) },
        });
      if (meta.history) {
        storeRef.current.dispatch({
          type: "SET_HISTORY",
          payload: { history: meta.history as StepId[] },
        });
      }
    }

    const currentSnapshot = storeRef.current.getSnapshot();
    const currentActiveSteps = currentSnapshot.activeSteps;

    // Must come from the snapshot: the dispatches above already moved the store,
    // while the `currentStepId` render closure still holds the pre-hydration value.
    if (!currentSnapshot.currentStepId && currentActiveSteps.length > 0) {
      const startId =
        initialStepId && currentActiveSteps.some((s) => s.id === initialStepId)
          ? initialStepId
          : currentActiveSteps[0].id;

      storeRef.current.dispatch({
        type: "SET_CURRENT_STEP_ID",
        payload: { stepId: startId },
      });

      if (currentSnapshot.history.length === 0) {
        storeRef.current.dispatch({
          type: "SET_HISTORY",
          payload: { history: [startId] },
        });
      }

      // Mark initial step as visited
      const currentVisited = new Set(
        storeRef.current.getSnapshot().visitedSteps
      );
      if (!currentVisited.has(startId)) {
        currentVisited.add(startId);
        storeRef.current.dispatch({
          type: "SET_VISITED_STEPS",
          payload: { steps: currentVisited },
        });
      }

    }

    // Outside the block above: a wizard that hydrated a persisted step never
    // enters it, and this is the only place the initial loading flag is
    // cleared.
    if (currentSnapshot.activeSteps.length > 0) {
      storeRef.current.updateMeta({ isLoading: false });
    }
  }, [activeSteps, initialStepId, currentStepId, persistenceAdapter]);

  return (
    <WizardStoreContext.Provider value={storeRef.current}>
      <WizardStateContext.Provider value={stateValue}>
        <WizardActionsContext.Provider value={actionsValue}>
          {children}
        </WizardActionsContext.Provider>
      </WizardStateContext.Provider>
    </WizardStoreContext.Provider>
  );
}

export function useWizardState<
  T = unknown,
  StepId extends string = string,
>(): IWizardState<T, StepId> {
  const context = useContext(WizardStateContext);
  if (!context)
    throw new Error("useWizardState must be used within a WizardProvider");
  return context as IWizardState<T, StepId>;
}

export function useWizardValue<TValue = any>(
  path: string,
  options?: { isEqual?: (a: TValue, b: TValue) => boolean }
): TValue {
  const store = useContext(WizardStoreContext);
  if (!store)
    throw new Error("useWizardValue must be used within a WizardProvider");
  const lastStateRef = useRef<any>(null);
  const lastValueRef = useRef<any>(null);
  const getSnapshot = useCallback(() => {
    const data = store.getSnapshot().data;
    if (data === lastStateRef.current) return lastValueRef.current;
    const value = getByPath(data, path) as TValue;
    if (
      lastValueRef.current !== undefined &&
      (options?.isEqual || Object.is)(lastValueRef.current, value)
    ) {
      lastStateRef.current = data;
      return lastValueRef.current;
    }
    lastStateRef.current = data;
    lastValueRef.current = value;
    return value;
  }, [store, path, options?.isEqual]);
  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardError(path: string): string | undefined {
  const store = useContext(WizardStoreContext);
  if (!store)
    throw new Error("useWizardError must be used within a WizardProvider");
  const getSnapshot = useCallback(() => {
    const errors = store.getSnapshot().errors;
    for (const [stepId, stepErrors] of Object.entries(errors)) {
      const typed = stepErrors as Record<string, string>;
      if (typed[path]) return typed[path];
      if (path.startsWith(stepId + ".") && typed[stepId]) return typed[stepId];
      const last = path.split(".").pop();
      if (last && typed[last]) return typed[last];
    }
    return undefined;
  }, [store, path]);
  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardSelector<TSelected = any>(
  selector: (state: any) => TSelected,
  options?: { isEqual?: (a: TSelected, b: TSelected) => boolean }
): TSelected {
  const store = useContext(WizardStoreContext);
  if (!store)
    throw new Error("useWizardSelector must be used within a WizardProvider");
  const lastStateRef = useRef<any>(null);
  const lastResultRef = useRef<any>(null);
  const getSnapshot = useCallback(() => {
    const full = store.getSnapshot();
    if (full === lastStateRef.current) return lastResultRef.current;
    const res = selector(full);
    if (
      lastResultRef.current !== null &&
      (options?.isEqual || Object.is)(lastResultRef.current, res)
    ) {
      lastStateRef.current = full;
      return lastResultRef.current;
    }
    lastStateRef.current = full;
    lastResultRef.current = res;
    return res;
  }, [store, selector, options?.isEqual]);
  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useWizardActions<
  StepId extends string = string,
>(): IWizardActions<StepId> {
  const context = useContext(WizardActionsContext);
  if (!context)
    throw new Error("useWizardActions must be used within a WizardProvider");
  return context as IWizardActions<StepId>;
}

export function useWizardContext<
  T = any,
  StepId extends string = string,
>(): IWizardContext<T, StepId> & { store: IWizardStore<T, StepId> } {
  const state = useWizardState<T, StepId>();
  const actions = useWizardActions<StepId>();
  const store = useContext(WizardStoreContext) as IWizardStore<T, StepId>;
  const wizardData = useWizardSelector((s: IWizardState<T, StepId>) => s.data);
  const allErrors = useWizardSelector((s: IWizardState<T, StepId>) => s.errors);
  const { data: _d, errors: _e, ...stateProps } = state;
  return useMemo(
    () => ({
      ...stateProps,
      ...actions,
      wizardData,
      allErrors,
      // Backward compatibility aliases
      data: wizardData,
      errors: allErrors,
      store,
    }),
    [stateProps, actions, wizardData, allErrors, store]
  ) as IWizardContext<T, StepId> & {
    store: IWizardStore<T, StepId>;
    data: T;
    errors: Record<string, any>;
  };
}
