import { createWizardFactory } from "wizzard-stepper-react";

// Define the schema type
export interface ConditionalWizardSchema {
  hasCoApplicant: boolean;
  coApplicantName?: string;
}

// Create the factory and export the typed hooks
export const {
  WizardProvider,
  useWizard,
  useWizardValue,
  useWizardSelector,
  useWizardActions,
  createStep,
} = createWizardFactory<ConditionalWizardSchema>();
