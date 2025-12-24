import { createWizardFactory } from "wizzard-stepper-react";
import { z } from "zod";

// --- Schemas ---
export const step1Schema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars"),
  email: z.string().email("Invalid email address"),
});

export const step2Schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 chars"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
export type RHFZodSchema = Step1Data & Step2Data;

export const {
  WizardProvider,
  useWizard,
  useWizardActions,
  useWizardValue,
  useWizardSelector,
  useWizardError,
  createStep,
} = createWizardFactory<RHFZodSchema>();
