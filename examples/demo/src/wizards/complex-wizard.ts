import { createWizardFactory } from "wizzard-stepper-react";
import { z } from "zod";

// 1. Define Schema with nested arrays
export const complexSchema = z.object({
  parentName: z.string().min(1, "Parent name is required"),
  children: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Child name is required"),
        age: z.coerce.number().min(0, "Age must be positive"),
      })
    )
    .min(1, "At least one child is required"),
});

export type ComplexFormData = z.infer<typeof complexSchema>;
export type Child = ComplexFormData["children"][0];

export type StepId = "parent" | "children" | "summary";
// 2. Create Typed Wizard Factory
// This gives us hooks strictly typed to FormData
export const {
  WizardProvider,
  useWizardValue,
  useWizardActions,
  useWizardError,
  useWizardSelector,
  useWizardState,
  createStep,
} = createWizardFactory<ComplexFormData, StepId>();
