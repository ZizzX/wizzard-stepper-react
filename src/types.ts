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
 * Validation Mode
 * - 'onChange': Validate on every data change (debounced)
 * - 'onStepChange': Validate only when moving to next step
 * - 'manual': Validate only when manually triggered
 */
export type ValidationMode = 'onChange' | 'onStepChange' | 'manual';

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
export interface IStepConfig<TStepData = unknown, TGlobalContext = unknown, StepId extends string = string> {
    id: StepId;
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
     * @deprecated Use validationMode instead
     */
    autoValidate?: boolean;
    /**
     * Control when validation occurs for this step.
     * - 'onChange': Validate on every keystroke (debounced)
     * - 'onStepChange': Validate only when attempting to leave the step
     * - 'manual': Only validate when explicitly triggered
     */
    validationMode?: ValidationMode;
    /**
     * Optional React Component to render for this step.
     * Used by the <WizardStepRenderer /> component.
     */
    component?: React.ComponentType<any>;
    /**
     * Override global persistence adapter for this specific step.
     */
    persistenceAdapter?: IPersistenceAdapter;
    /**
     * Control when persistence occurs for this specific step.
     * - 'onStepChange': Save when moving between steps (default)
     * - 'onChange': Save on every data change (debounced)
     * - 'manual': Save only when manually triggered
     */
    persistenceMode?: PersistenceMode;
}

/**
 * Wizard Configuration
 * T: Type of the Global Wizard Data
 */
export interface IWizardConfig<T = unknown, StepId extends string = string> {
    /**
     * Array of step configurations
     */
    steps: IStepConfig<unknown, T, StepId>[];
    /**
     * Global auto-validation setting (default: true)
     * @deprecated Use validationMode instead
     */
    autoValidate?: boolean;
    /**
     * Default validation mode for all steps (default: 'onChange')
     */
    validationMode?: ValidationMode;
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
    /**
     * Callback triggered when step changes.
     * Useful for routing integration or analytics.
     */
    onStepChange?: (fromStep: StepId | null, toStep: StepId, data: T) => void;
}

/**
 * Core Wizard Context State
 */
export interface IWizardContext<T = unknown, StepId extends string = string> {
    currentStep: IStepConfig<unknown, T, StepId> | null;
    currentStepIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isLoading: boolean;
    isPending?: boolean;

    /**
     * Active steps (those meeting conditions)
     */
    activeSteps: IStepConfig<unknown, T, StepId>[];

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
    visitedSteps: Set<StepId>;
    completedSteps: Set<StepId>;
    errorSteps: Set<StepId>;

    /**
     * Navigation Actions
     */
    goToNextStep: () => Promise<void>;
    goToPrevStep: () => void;
    goToStep: (stepId: StepId) => Promise<boolean>;

    /**
     * Data Actions
     */
    setStepData: (stepId: StepId, data: unknown) => void; // Internal use usually
    handleStepChange: (field: string, value: unknown) => void; // Helper for simple forms

    /**
     * Set data by path (supports dot notation and arrays, e.g., 'user.name' or 'items[0].value')
     */
    setData: (path: string, value: unknown, options?: { debounceValidation?: number }) => void;

    /**
     * Bulk update wizard data.
     * @param data Partial data to merge.
     * @param options.replace If true, replaces entire state instead of merging.
     */
    updateData: (data: Partial<T>, options?: { replace?: boolean }) => void;

    /**
     * Get data by path
     */
    getData: (path: string, defaultValue?: unknown) => unknown;

    /**
     * Validation & Persistence
     */
    validateStep: (sid: StepId) => Promise<boolean>;
    validateAll: () => Promise<{ isValid: boolean; errors: Record<string, Record<string, string>> }>;
    save: () => void; // Manual persistence save
    clearStorage: () => void;
}
