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
    steps: IStepConfig<unknown, T>[];
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
    currentStep: IStepConfig<unknown, T> | null;
    currentStepIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isLoading: boolean;
    isPending?: boolean;

    /**
     * Active steps (those meeting conditions)
     */
    activeSteps: IStepConfig<unknown, T>[];

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
    goToStep: (stepId: string) => Promise<boolean>;

    /**
     * Data Actions
     */
    setStepData: (stepId: string, data: unknown) => void; // Internal use usually
    handleStepChange: (field: string, value: unknown) => void; // Helper for simple forms

    /**
     * Set data by path (supports dot notation and arrays, e.g., 'user.name' or 'items[0].value')
     */
    setData: (path: string, value: unknown, options?: { debounceValidation?: number }) => void;

    /**
     * Get data by path
     */
    getData: (path: string, defaultValue?: unknown) => unknown;

    /**
     * Validation & Persistence
     */
    validateStep: (stepId: string) => Promise<boolean>;
    validateAll: () => Promise<boolean>;
    save: () => void; // Manual persistence save
    clearStorage: () => void;
}
