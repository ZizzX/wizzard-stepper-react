import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';
import { ZodType } from 'zod';
import { Schema } from 'yup';

/**
 * Validation Result Interface
 */
type ValidationResult = {
    isValid: boolean;
    errors?: Record<string, string>;
};
/**
 * Validator Adapter Interface
 * TData: The type of data this validator expects
 */
interface IValidatorAdapter<TData = unknown> {
    validate: (data: TData) => Promise<ValidationResult> | ValidationResult;
}
/**
 * Persistence Mode
 * - 'onStepChange': Save when moving between steps (default)
 * - 'onChange': Save on every data change (debounced)
 * - 'manual': Save only when manually triggered
 */
type PersistenceMode = 'onStepChange' | 'onChange' | 'manual';
/**
 * Persistence Adapter Interface
 */
interface IPersistenceAdapter {
    saveStep: <T>(stepId: string, data: T) => void;
    getStep: <T>(stepId: string) => T | undefined;
    clear: () => void;
}
/**
 * Step Configuration
 * TStepData: Type of data for this step
 * TGlobalContext: Type of the global wizard data
 */
interface IStepConfig<TStepData = unknown, TGlobalContext = unknown> {
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
interface IWizardConfig<T = unknown> {
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
interface IWizardContext<T = unknown> {
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
    setStepData: (stepId: string, data: any) => void;
    handleStepChange: (field: string, value: any) => void;
    /**
     * Set data by path (supports dot notation and arrays, e.g., 'user.name' or 'items[0].value')
     */
    setData: (path: string, value: any) => void;
    /**
     * Get data by path
     */
    getData: (path: string, defaultValue?: any) => any;
    /**
     * Validation & Persistence
     */
    validateStep: (stepId: string) => Promise<boolean>;
    validateAll: () => Promise<boolean>;
    save: () => void;
    clearStorage: () => void;
}

interface WizardProviderProps<T> {
    config: IWizardConfig<T>;
    initialData?: T;
    children: React.ReactNode;
}
declare function WizardProvider<T extends Record<string, any>>({ config, initialData, children, }: WizardProviderProps<T>): react_jsx_runtime.JSX.Element;
declare function useWizardContext<T = any>(): IWizardContext<T>;

declare const useWizard: <T = any>() => IWizardContext<T>;

declare class MemoryAdapter implements IPersistenceAdapter {
    private storage;
    saveStep<T>(stepId: string, data: T): void;
    getStep<T>(stepId: string): T | undefined;
    clear(): void;
}

declare class LocalStorageAdapter implements IPersistenceAdapter {
    private prefix;
    constructor(prefix?: string);
    private getKey;
    saveStep<T>(stepId: string, data: T): void;
    getStep<T>(stepId: string): T | undefined;
    clear(): void;
}

declare class ZodAdapter<T> implements IValidatorAdapter<T> {
    private schema;
    constructor(schema: ZodType<T>);
    validate(data: T): Promise<ValidationResult>;
}

declare class YupAdapter<T> implements IValidatorAdapter<T> {
    private schema;
    constructor(schema: Schema<T>);
    validate(data: T): Promise<ValidationResult>;
}

/**
 * Retrieves a value from an object by path (dot notation or brackets)
 */
declare function getByPath(obj: any, path: string, defaultValue?: any): any;
/**
 * Immutably sets a value in an object by path
 */
declare function setByPath<T extends object>(obj: T, path: string, value: any): T;

export { type IPersistenceAdapter, type IStepConfig, type IValidatorAdapter, type IWizardConfig, type IWizardContext, LocalStorageAdapter, MemoryAdapter, type PersistenceMode, type ValidationResult, WizardProvider, YupAdapter, ZodAdapter, getByPath, setByPath, useWizard, useWizardContext };
