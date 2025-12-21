import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  IWizardConfig,
  IWizardContext,
  PersistenceMode,
  IPersistenceAdapter,
} from '../types';
import { MemoryAdapter } from '../adapters/persistence/MemoryAdapter';

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

  // Hydration Helper
  const hydrate = useCallback(() => {
    setIsLoading(true);
    // TODO: Implement full hydration logic (restore data, currentStep, visited, etc if persisted)
    // For now, we hydrate data per step on demand or global data? 
    // Usually persistence saves "wizard_data" or per step. 
    // If saving per step, we need to merge.
    // If simpler, let's assume we save globally for now or iterate steps.
    
    // Simplistic hydration for now:
    // If the adapter supports 'wizard_data', load it. 
    // We didn't define a global key in interface, just saveStep. 
    // Adapters might need 'save' for global or we iterate?
    // Let's assume we load data for *all* steps
    
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
    }
  }, [persistenceAdapter, persistenceMode]);

  // Action: Set Step Data
  const setStepData = useCallback((stepId: string, data: any) => {
    setWizardData((prev) => {
      const newData = { ...prev, ...data };
      // Save if mode is 'onChange'
      if (persistenceMode === 'onChange') {
         saveData('onChange', stepId, data); // Debounce could be added here
      }
      return newData;
    });
  }, [persistenceMode, saveData]);

  // Action: Handle specific field change (helper)
  const handleStepChange = useCallback((field: string, value: any) => {
    if (!currentStepId) return;
    setStepData(currentStepId, { [field]: value });
  }, [currentStepId, setStepData]);
  
  // Validation Logic
  const validateStep = useCallback(async (stepId: string): Promise<boolean> => {
    const step = config.steps.find(s => s.id === stepId);
    if (!step) return true;
    
    // Check if adapter exists
    if (!step.validationAdapter) return true;

    // We assume data for step is subset of wizardData or wizardData itself?
    // Usually validation runs on the *whole* data or *step* data.
    // Let's pass the global wizardData for context-aware validation, 
    // OR expected step structure. Adapter defines TData.
    // We pass `wizardData` to adapter. User adapter filters if needed.
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
  const goToStep = useCallback(async (stepId: string) => {
    // Check flow logic? usually users can jump back, but jumping forward requires validation of previous?
    const targetIndex = activeSteps.findIndex(s => s.id === stepId);
    if (targetIndex === -1) return;

    // If moving forward, validate current
    if (targetIndex > currentStepIndex) {
       const shouldValidate = currentStep?.autoValidate ?? config.autoValidate ?? true;
       if (shouldValidate) {
         const isValid = await validateStep(currentStepId);
         if (!isValid) return; // Block
       }
    }
    
    // Save current step on change
    if (persistenceMode === 'onStepChange' && currentStep) {
        // We usually save specific step data. But here 'wizardData' is global.
        // We rely on 'setStepData' having updated 'wizardData'.
        // We just need to trigger persistence for this step if it wasn't manual.
        // Actually, 'onStepChange' usually implies saving state *now* 
        // We'll save the *current* step's data part? or just trigger save?
        // Since wizardData is global, let's trying to save partial?
        // Or just save the whole thing keyed by step? 
        // Simpler: Save 'wizardData' into the step (or global).
        // The interface `saveStep(stepId, data)` suggests per-step.
        // We'll pass `wizardData` for now. User adapter decides.
        saveData('onStepChange', currentStepId, wizardData); 
    }

    setVisitedSteps(prev => new Set(prev).add(currentStepId));
    setCurrentStepId(stepId);
    window.scrollTo(0, 0);
  }, [activeSteps, currentStepId, currentStep, currentStepIndex, config.autoValidate, persistenceMode, saveData, wizardData, validateStep]);

  const goToNextStep = useCallback(async () => {
     if (isLastStep) return;
     const nextStep = activeSteps[currentStepIndex + 1];
     if (nextStep) {
       // Mark current as completed if valid? 
       // Only mark completed if moved past.
       await goToStep(nextStep.id);
       // If successful move (currentStepId changed), mark prev as completed?
       // Logic is tricky cause goToStep is async but state update is scheduled.
       // We can assume if we are here (and logic flows), we might update state.
       // Better: effect listening to step change updates completion?
       // Or just setCompleted inside goToStep?
       setCompletedSteps(prev => new Set(prev).add(currentStepId));
     }
  }, [activeSteps, currentStepIndex, isLastStep, currentStepId, goToStep]);

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
    save: () => saveData('manual', currentStepId, wizardData),
    clearStorage: () => persistenceAdapter.clear(),
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
