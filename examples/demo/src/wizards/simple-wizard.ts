import { createWizardFactory } from "wizzard-stepper-react";

export interface SimpleWizardSchema {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const {
  WizardProvider,
  useWizard,
  useWizardActions,
  useWizardValue,
  useWizardSelector,
  useWizardError,
  useWizardState,
  createStep,
} = createWizardFactory<SimpleWizardSchema>();
