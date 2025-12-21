/**
 * Validation Result Interface
 */
export type ValidationResult = {
    isValid: boolean;
    errors?: Record<string, string>;
};

/**
 * Validator Adapter Interface
 * TData: The type of data this validator expects
 */
export interface IValidatorAdapter<TData = unknown> {
    validate: (data: TData) => Promise<ValidationResult> | ValidationResult;
}

/**
 * Persistence Mode
 * - 'onStepChange': Save when moving between steps (default)
 * - 'onChange': Save on every data change (debounced)
 * - 'manual': Save only when manually triggered
 */
export type PersistenceMode = 'onStepChange' | 'onChange' | 'manual';

/**
 * Persistence Adapter Interface
 */
export interface IPersistenceAdapter {
    saveStep: <T>(stepId: string, data: T) => void;
    getStep: <T>(stepId: string) => T | undefined;
    clear: () => void;
}

/**
 * Step Configuration
 * TStepData: Type of data for this step
 * TGlobalContext: Type of the global wizard data
 */
export interface IStepConfig<TStepData = unknown, TGlobalContext = unknown> {
    id: string;
    label: string;
    /**
     * Predicate to determine if step should be included/visible.
     * If returns false, step is strictly skipped.
     */
    condition?: (context: TGlobalContext) => boolean;
    /**
     * Adapter for validation logic
     */
    validationAdapter?: IValidatorAdapter<TStepData>;
    /**
     * Override global auto-validation setting for this step
     */
    autoValidate?: boolean;
}

/**
 * Wizard Configuration
 * T: Type of the Global Wizard Data
 */
export interface IWizardConfig<T = unknown> {
    /**
     * Array of step configurations
     */
    steps: IStepConfig<any, T>[];
    /**
     * Global auto-validation setting (default: true)
     */
    autoValidate?: boolean;
    /**
     * Persistence configuration
     */
    persistence?: {
        mode?: PersistenceMode;
        adapter?: IPersistenceAdapter;
        /**
         * Storage key prefix (default: 'wizard_')
         */
        storageKey?: string;
    };
}

/**
 * Core Wizard Context State
 */
export interface IWizardContext<T = unknown> {
    currentStep: IStepConfig<any, T> | null;
    currentStepIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isLoading: boolean;

    /**
     * Active steps (those meeting conditions)
     */
    activeSteps: IStepConfig<any, T>[];

    /**
     * Unified Wizard Data
     */
    wizardData: T;

    /**
     * Errors keyed by stepId -> field -> message
     */
    allErrors: Record<string, Record<string, string>>;

    /**
     * Steps Status
     */
    visitedSteps: Set<string>;
    completedSteps: Set<string>;
    errorSteps: Set<string>;

    /**
     * Navigation Actions
     */
    goToNextStep: () => Promise<void>;
    goToPrevStep: () => void;
    goToStep: (stepId: string) => void;

    /**
     * Data Actions
     */
    setStepData: (stepId: string, data: any) => void; // Internal use usually
    handleStepChange: (field: string, value: any) => void; // Helper for simple forms

    /**
     * Validation & Persistence
     */
    validateStep: (stepId: string) => Promise<boolean>;
    validateAll: () => Promise<boolean>;
    save: () => void; // Manual persistence save
    clearStorage: () => void;
}
