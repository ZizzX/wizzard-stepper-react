import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type {
  IWizardConfig,
  IWizardContext,
  PersistenceMode,
  IPersistenceAdapter,
} from '../types';
import { MemoryAdapter } from '../adapters/persistence/MemoryAdapter';
import { getByPath, setByPath } from '../utils/data';

const WizardContext = createContext<IWizardContext<any> | undefined>(undefined);

interface WizardProviderProps<T> {
  config: IWizardConfig<T>;
  initialData?: T;
  children: React.ReactNode;
}

export function WizardProvider<T extends Record<string, any>>({
  config,
  initialData,
  children,
}: WizardProviderProps<T>) {
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [wizardData, setWizardData] = useState<T>((initialData || {}) as T);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [errorSteps, setErrorSteps] = useState<Set<string>>(new Set());
  const [allErrors, setAllErrors] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Persistence Setup
  const persistenceAdapter = useMemo<IPersistenceAdapter>(() => {
    return config.persistence?.adapter || new MemoryAdapter();
  }, [config.persistence?.adapter]);

  const persistenceMode = config.persistence?.mode || 'onStepChange';

  // Calculate Active Steps (Conditional Logic)
  const activeSteps = useMemo(() => {
    return config.steps.filter((step) => {
      if (step.condition) {
        return step.condition(wizardData);
      }
      return true;
    });
  }, [config.steps, wizardData]);

  // Set initial step if not set
  useEffect(() => {
    if (!currentStepId && activeSteps.length > 0) {
      setCurrentStepId(activeSteps[0].id);
      setIsLoading(false);
    }
  }, [activeSteps, currentStepId]);

  // Derived state
  const currentStep = useMemo(() => activeSteps.find((s) => s.id === currentStepId) || null, [activeSteps, currentStepId]);
  const currentStepIndex = useMemo(() => activeSteps.findIndex((s) => s.id === currentStepId), [activeSteps, currentStepId]);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  // Constants
  const META_KEY = '__wizzard_meta__';

  // Hydration Helper
  const hydrate = useCallback(() => {
    setIsLoading(true);
    
    // 1. Load Metadata (Current Step, Visited, etc.)
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

    // 2. Load Data
    // We assume data is distributed across steps OR stored centrally.
    // Given the current implementation saves 'wizardData' to each stepId, 
    // we can iterate steps.
    const loadedData: Partial<T> = {};
    config.steps.forEach(step => {
       const stepData = persistenceAdapter.getStep(step.id);
       if (stepData) {
         Object.assign(loadedData, stepData);
       }
    });

    if (Object.keys(loadedData).length > 0) {
        setWizardData(prev => ({ ...prev, ...loadedData }));
    }
    setIsLoading(false);
  }, [config.steps, persistenceAdapter]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Save logic
  const saveData = useCallback((mode: PersistenceMode, stepId: string, data: any) => {
    if (mode === persistenceMode || mode === 'manual') {
        persistenceAdapter.saveStep(stepId, data);
        
        // Also save metadata whenever we save data (if appropriate)
        // Or we can save metadata explicitly on navigation.
    }
  }, [persistenceAdapter, persistenceMode]);

  // Explicit Metadata Save

  // Action: Set Step Data
  const setStepData = useCallback((stepId: string, data: any) => {
    setWizardData((prev) => {
      const newData = { ...prev, ...data };
      // Save if mode is 'onChange'
      if (persistenceMode === 'onChange') {
         // We must save the FULL new data, not just the partial 'data' update, 
         // otherwise we overwrite the storage with just the single field.
         saveData('onChange', stepId, newData); 
      }
      return newData;
    });
  }, [persistenceMode, saveData]);

  // Action: Set Data by Path
  const setData = useCallback((path: string, value: any) => {
    setWizardData((prev) => {
      const newData = setByPath(prev, path, value);
      
      if (persistenceMode === 'onChange') {
        saveData('onChange', currentStepId, newData);
      }
      return newData;
    });
  }, [persistenceMode, saveData, currentStepId]);

  // Action: Get Data by Path
  const getData = useCallback((path: string, defaultValue?: any) => {
    return getByPath(wizardData, path, defaultValue);
  }, [wizardData]);

  // Action: Handle specific field change (helper)
  const handleStepChange = useCallback((field: string, value: any) => {
    if (!currentStepId) return;
    setData(field, value);
  }, [setData, currentStepId]);
  
  // Validation Logic
  const validateStep = useCallback(async (stepId: string): Promise<boolean> => {
    const step = config.steps.find(s => s.id === stepId);
    if (!step) return true;
    
    // Check if adapter exists
    if (!step.validationAdapter) return true;

    const result = await step.validationAdapter.validate(wizardData);
    
    if (!result.isValid) {
      setAllErrors(prev => ({
        ...prev,
        [stepId]: result.errors || {}
      }));
      setErrorSteps(prev => new Set(prev).add(stepId));
      return false;
    } else {
      setAllErrors(prev => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
      setErrorSteps(prev => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
      return true;
    }
  }, [config.steps, wizardData]);

  const validateAll = useCallback(async (): Promise<boolean> => {
    let isValid = true;
    for (const step of activeSteps) {
      const stepValid = await validateStep(step.id);
      if (!stepValid) isValid = false;
    }
    return isValid;
  }, [activeSteps, validateStep]);

  // Navigation
  const goToStep = useCallback(async (stepId: string): Promise<boolean> => {
    const targetIndex = activeSteps.findIndex(s => s.id === stepId);
    if (targetIndex === -1) return false;

    // If moving forward, validate current
    if (targetIndex > currentStepIndex) {
       const shouldValidate = currentStep?.autoValidate ?? config.autoValidate ?? true;
       if (shouldValidate) {
         const isValid = await validateStep(currentStepId);
         if (!isValid) return false; // Block
       }
    }
    
    // Save current step data logic
    if (persistenceMode === 'onStepChange' && currentStep) {
        saveData('onStepChange', currentStepId, wizardData); 
    }

    // Update State
    const nextVisited = new Set(visitedSteps).add(currentStepId);
    setVisitedSteps(nextVisited);
    setCurrentStepId(stepId);
    
    // Persist Metadata (New Step Position)
    // We need to pass the *new* values because state updates are async
    if (persistenceMode !== 'manual') {
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
        // Validation happens inside goToStep. If it fails, we shouldn't mark as completed.
        const success = await goToStep(nextStep.id);
        
        if (success) {
            // Mark completed logic ONLY on success
            const nextCompleted = new Set(completedSteps).add(currentStepId);
            setCompletedSteps(nextCompleted);
            
            // We need to update metadata again to include the new 'completed' status.
            // The previous save in goToStep didn't know about this new completion.
             if (persistenceMode !== 'manual') {
                 persistenceAdapter.saveStep(META_KEY, {
                     currentStepId: nextStep.id,
                     visited: Array.from(new Set(visitedSteps).add(currentStepId)),
                     completed: Array.from(nextCompleted) // Updated completed steps
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

  // Context Value
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
    save: useCallback(() => saveData('manual', currentStepId, wizardData), [saveData, currentStepId, wizardData]),
    clearStorage: useCallback(() => persistenceAdapter.clear(), [persistenceAdapter]),
    setData,
    getData,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizardContext<T = any>() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context as IWizardContext<T>;
}
