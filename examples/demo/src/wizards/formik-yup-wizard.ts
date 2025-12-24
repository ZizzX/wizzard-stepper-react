import { createWizardFactory } from "wizzard-stepper-react";
import * as Yup from "yup";

// --- Schemas ---
export const step1Schema = Yup.object({
  jobTitle: Yup.string().required("Job title is required"),
  company: Yup.string().required("Company is required"),
});

export const step2Schema = Yup.object({
  skills: Yup.string()
    .min(10, "Describe skills with at least 10 chars")
    .required("Skills required"),
});

export interface FormikYupSchema {
  jobTitle?: string;
  company?: string;
  skills?: string;
}

export const {
  WizardProvider,
  useWizard,
  useWizardActions,
  useWizardValue,
  useWizardSelector,
  useWizardError,
  createStep,
} = createWizardFactory<FormikYupSchema>();
