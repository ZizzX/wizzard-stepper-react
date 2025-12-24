import React from "react";
import {
  WizardProvider as BaseWizardProvider,
  useWizardContext as useBaseWizardContext,
  useWizardValue as useBaseWizardValue,
  useWizardSelector as useBaseWizardSelector,
  useWizardError as useBaseWizardError,
  useWizardActions as useBaseWizardActions,
  useWizardState as useBaseWizardState,
} from "./context/WizardContext";
import { useWizard as useBaseWizard } from "./hooks/useWizard";
import type { IWizardConfig, IWizardContext, IStepConfig } from "./types";
import type { Path, PathValue } from "./utils/types";

/**
 * createWizardFactory
 *
 * Creates a strongly-typed set of Wizard components and hooks for a specific data schema.
 * This ensures full type safety across your entire wizard implementation without manual casting.
 *
 * @template TSchema The shape of your wizard's global data state
 */
export function createWizardFactory<TSchema extends Record<string, any>>() {
  /**
   * Typed Provider
   */
  const WizardProvider = ({
    config,
    initialData,
    children,
  }: {
    config: IWizardConfig<TSchema>;
    initialData?: Partial<TSchema>;
    children: React.ReactNode;
  }) => {
    return (
      <BaseWizardProvider<TSchema>
        config={config}
        initialData={initialData as TSchema}
      >
        {children}
      </BaseWizardProvider>
    );
  };

  /**
   * Typed useWizard
   * Returns the full context with TSchema typed data and methods
   */
  const useWizard = (): IWizardContext<TSchema> => {
    return useBaseWizard<TSchema>();
  };

  /**
   * Typed useWizardContext
   * similar to useWizard but explicit about strict context usage
   */
  const useWizardContext = () => {
    return useBaseWizardContext<TSchema>();
  };

  /**
   * Typed useWizardValue
   * @param path Dot-notation path to the value
   */
  const useWizardValue = <P extends Path<TSchema>>(
    path: P
  ): PathValue<TSchema, P> => {
    return useBaseWizardValue<PathValue<TSchema, P>>(path);
  };

  /**
   * Typed useWizardSelector
   * @param selector Function to select a slice of state
   */
  const useWizardSelector = <TSelected,>(
    selector: (state: TSchema) => TSelected
  ): TSelected => {
    return useBaseWizardSelector<TSelected>(selector);
  };

  /**
   * Typed useWizardError
   * @param path Dot-notation path to check for errors
   */
  const useWizardError = <P extends Path<TSchema>>(
    path: P
  ): string | undefined => {
    return useBaseWizardError(path);
  };

  /**
   * Typed useWizardActions
   * No generic needed for actions usually, but we wrap it for consistency
   */
  const useWizardActions = () => {
    return useBaseWizardActions();
  };

  /**
   * Typed useWizardState
   * Access to raw internal state if needed (advanced)
   */
  const useWizardState = () => {
    return useBaseWizardState();
  };

  /**
   * Helper to create a typed step configuration.
   * By using this helper, TypeScript can infer TStepData from the validationAdapter or other properties.
   */
  const createStep = <TStepData = unknown,>(
    config: IStepConfig<TStepData, TSchema>
  ) => config;

  return {
    WizardProvider,
    useWizard,
    useWizardContext,
    useWizardValue,
    useWizardSelector,
    useWizardError,
    useWizardActions,
    useWizardState,
    createStep,
  };
}
