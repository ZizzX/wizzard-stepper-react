var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/context/WizardContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

// src/adapters/persistence/MemoryAdapter.ts
var MemoryAdapter = class {
  constructor() {
    __publicField(this, "storage", {});
  }
  saveStep(stepId, data) {
    this.storage[stepId] = data;
  }
  getStep(stepId) {
    return this.storage[stepId];
  }
  clear() {
    this.storage = {};
  }
};

// src/utils/data.ts
function getByPath(obj, path, defaultValue) {
  if (!path) return obj;
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let result = obj;
  for (const key of keys) {
    if (result === void 0 || result === null) return defaultValue;
    result = result[key];
  }
  return result !== void 0 ? result : defaultValue;
}
function setByPath(obj, path, value) {
  if (!path) return value;
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  const update = (current, index) => {
    if (index === keys.length) return value;
    const key = keys[index];
    const isKeyNumeric = !isNaN(Number(key)) && key.trim() !== "";
    let nextLevel = current;
    if (!nextLevel || typeof nextLevel !== "object") {
      nextLevel = isKeyNumeric ? [] : {};
    } else {
      nextLevel = Array.isArray(nextLevel) ? [...nextLevel] : { ...nextLevel };
    }
    const nextKey = isKeyNumeric ? Number(key) : key;
    nextLevel[nextKey] = update(nextLevel[nextKey], index + 1);
    return nextLevel;
  };
  return update(obj, 0);
}

// src/context/WizardContext.tsx
import { jsx } from "react/jsx-runtime";
var WizardContext = createContext(void 0);
function WizardProvider({
  config,
  initialData,
  children
}) {
  const [currentStepId, setCurrentStepId] = useState("");
  const [wizardData, setWizardData] = useState(initialData || {});
  const [visitedSteps, setVisitedSteps] = useState(/* @__PURE__ */ new Set());
  const [completedSteps, setCompletedSteps] = useState(/* @__PURE__ */ new Set());
  const [errorSteps, setErrorSteps] = useState(/* @__PURE__ */ new Set());
  const [allErrors, setAllErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const persistenceAdapter = useMemo(() => {
    return config.persistence?.adapter || new MemoryAdapter();
  }, [config.persistence?.adapter]);
  const persistenceMode = config.persistence?.mode || "onStepChange";
  const activeSteps = useMemo(() => {
    return config.steps.filter((step) => {
      if (step.condition) {
        return step.condition(wizardData);
      }
      return true;
    });
  }, [config.steps, wizardData]);
  useEffect(() => {
    if (!currentStepId && activeSteps.length > 0) {
      setCurrentStepId(activeSteps[0].id);
      setIsLoading(false);
    }
  }, [activeSteps, currentStepId]);
  const currentStep = useMemo(() => activeSteps.find((s) => s.id === currentStepId) || null, [activeSteps, currentStepId]);
  const currentStepIndex = useMemo(() => activeSteps.findIndex((s) => s.id === currentStepId), [activeSteps, currentStepId]);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;
  const META_KEY = "__wizzard_meta__";
  const hydrate = useCallback(() => {
    setIsLoading(true);
    const metaFn = persistenceAdapter.getStep(META_KEY);
    if (metaFn) {
      if (metaFn.currentStepId) setCurrentStepId(metaFn.currentStepId);
      if (metaFn.visited) setVisitedSteps(new Set(metaFn.visited));
      if (metaFn.completed) setCompletedSteps(new Set(metaFn.completed));
    }
    const loadedData = {};
    config.steps.forEach((step) => {
      const stepData = persistenceAdapter.getStep(step.id);
      if (stepData) {
        Object.assign(loadedData, stepData);
      }
    });
    if (Object.keys(loadedData).length > 0) {
      setWizardData((prev) => ({ ...prev, ...loadedData }));
    }
    setIsLoading(false);
  }, [config.steps, persistenceAdapter]);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const saveData = useCallback((mode, stepId, data) => {
    if (mode === persistenceMode || mode === "manual") {
      persistenceAdapter.saveStep(stepId, data);
    }
  }, [persistenceAdapter, persistenceMode]);
  const setStepData = useCallback((stepId, data) => {
    setWizardData((prev) => {
      const newData = { ...prev, ...data };
      if (persistenceMode === "onChange") {
        saveData("onChange", stepId, newData);
      }
      return newData;
    });
  }, [persistenceMode, saveData]);
  const setData = useCallback((path, value2) => {
    setWizardData((prev) => {
      const newData = setByPath(prev, path, value2);
      if (persistenceMode === "onChange") {
        saveData("onChange", currentStepId, newData);
      }
      return newData;
    });
  }, [persistenceMode, saveData, currentStepId]);
  const getData = useCallback((path, defaultValue) => {
    return getByPath(wizardData, path, defaultValue);
  }, [wizardData]);
  const handleStepChange = useCallback((field, value2) => {
    if (!currentStepId) return;
    setData(field, value2);
  }, [setData, currentStepId]);
  const validateStep = useCallback(async (stepId) => {
    const step = config.steps.find((s) => s.id === stepId);
    if (!step) return true;
    if (!step.validationAdapter) return true;
    const result = await step.validationAdapter.validate(wizardData);
    if (!result.isValid) {
      setAllErrors((prev) => ({
        ...prev,
        [stepId]: result.errors || {}
      }));
      setErrorSteps((prev) => new Set(prev).add(stepId));
      return false;
    } else {
      setAllErrors((prev) => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
      setErrorSteps((prev) => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
      return true;
    }
  }, [config.steps, wizardData]);
  const validateAll = useCallback(async () => {
    let isValid = true;
    for (const step of activeSteps) {
      const stepValid = await validateStep(step.id);
      if (!stepValid) isValid = false;
    }
    return isValid;
  }, [activeSteps, validateStep]);
  const goToStep = useCallback(async (stepId) => {
    const targetIndex = activeSteps.findIndex((s) => s.id === stepId);
    if (targetIndex === -1) return false;
    if (targetIndex > currentStepIndex) {
      const shouldValidate = currentStep?.autoValidate ?? config.autoValidate ?? true;
      if (shouldValidate) {
        const isValid = await validateStep(currentStepId);
        if (!isValid) return false;
      }
    }
    if (persistenceMode === "onStepChange" && currentStep) {
      saveData("onStepChange", currentStepId, wizardData);
    }
    const nextVisited = new Set(visitedSteps).add(currentStepId);
    setVisitedSteps(nextVisited);
    setCurrentStepId(stepId);
    if (persistenceMode !== "manual") {
      persistenceAdapter.saveStep(META_KEY, {
        currentStepId: stepId,
        visited: Array.from(nextVisited),
        completed: Array.from(completedSteps)
      });
    }
    window.scrollTo(0, 0);
    return true;
  }, [activeSteps, currentStepId, currentStep, currentStepIndex, config.autoValidate, persistenceMode, saveData, wizardData, validateStep, visitedSteps, completedSteps, persistenceAdapter]);
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
            completed: Array.from(nextCompleted)
            // Updated completed steps
          });
        }
      }
    }
  }, [activeSteps, currentStepIndex, isLastStep, currentStepId, goToStep, visitedSteps, completedSteps, persistenceMode, persistenceAdapter]);
  const goToPrevStep = useCallback(() => {
    if (isFirstStep) return;
    const prevStep = activeSteps[currentStepIndex - 1];
    if (prevStep) {
      goToStep(prevStep.id);
    }
  }, [activeSteps, currentStepIndex, isFirstStep, goToStep]);
  const value = {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    isLoading,
    activeSteps,
    wizardData,
    allErrors,
    visitedSteps,
    completedSteps,
    errorSteps,
    goToNextStep,
    goToPrevStep,
    goToStep,
    setStepData,
    handleStepChange,
    validateStep,
    validateAll,
    save: useCallback(() => saveData("manual", currentStepId, wizardData), [saveData, currentStepId, wizardData]),
    clearStorage: useCallback(() => persistenceAdapter.clear(), [persistenceAdapter]),
    setData,
    getData
  };
  return /* @__PURE__ */ jsx(WizardContext.Provider, { value, children });
}
function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
}

// src/hooks/useWizard.ts
var useWizard = () => {
  return useWizardContext();
};

// src/adapters/persistence/LocalStorageAdapter.ts
var LocalStorageAdapter = class {
  constructor(prefix = "wizard_") {
    __publicField(this, "prefix");
    this.prefix = prefix;
  }
  getKey(stepId) {
    return `${this.prefix}${stepId}`;
  }
  saveStep(stepId, data) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getKey(stepId), JSON.stringify(data));
    } catch (error) {
      console.warn("LocalStorageAdapter: Failed to save step", error);
    }
  }
  getStep(stepId) {
    if (typeof window === "undefined") return void 0;
    try {
      const item = localStorage.getItem(this.getKey(stepId));
      return item ? JSON.parse(item) : void 0;
    } catch (error) {
      console.warn("LocalStorageAdapter: Failed to get step", error);
      return void 0;
    }
  }
  clear() {
    if (typeof window === "undefined") return;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};

// src/adapters/validation/ZodAdapter.ts
var ZodAdapter = class {
  constructor(schema) {
    __publicField(this, "schema");
    this.schema = schema;
  }
  async validate(data) {
    const result = await this.schema.safeParseAsync(data);
    if (result.success) {
      return { isValid: true };
    }
    const errors = {};
    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return { isValid: false, errors };
  }
};

// src/adapters/validation/YupAdapter.ts
import { ValidationError } from "yup";
var YupAdapter = class {
  constructor(schema) {
    __publicField(this, "schema");
    this.schema = schema;
  }
  async validate(data) {
    try {
      await this.schema.validate(data, { abortEarly: false });
      return { isValid: true };
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
        return { isValid: false, errors };
      }
      throw err;
    }
  }
};
export {
  LocalStorageAdapter,
  MemoryAdapter,
  WizardProvider,
  YupAdapter,
  ZodAdapter,
  getByPath,
  setByPath,
  useWizard,
  useWizardContext
};
//# sourceMappingURL=index.js.map