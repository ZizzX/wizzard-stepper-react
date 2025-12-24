import { z } from "zod";
import { createWizardFactory, ZodAdapter, MemoryAdapter } from "wizzard-stepper-react";
import { LocalStorageAdapter } from "wizzard-stepper-react";

// 1. Schema
const demoSchema = z.object({
  personal: z.object({
    firstName: z.string().min(2, "Name is too short"),
    lastName: z.string().min(2),
    email: z.string().email(),
  }),
  security: z.object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark"]),
    newsletter: z.boolean(),
  }),
});

export type DemoData = z.infer<typeof demoSchema>;

// 2. Factory
export const {
  WizardProvider,
  useWizard,
  useWizardActions,
  useWizardValue,
  useWizardError,
  createStep,
} = createWizardFactory<DemoData>();

// 3. Adapters
const personalAdapter = new ZodAdapter(demoSchema.pick({ personal: true }));
const securityAdapter = new ZodAdapter(demoSchema.pick({ security: true }));
const memoryStore = new MemoryAdapter(); // Explicit RAM store
const localStore = new LocalStorageAdapter("adv_demo_");

// 4. Config
export const advancedConfig = {
  persistence: {
    adapter: localStore, // Default: LocalStorage
    mode: "onChange" as const,
  },
  onStepChange: (from: string | null, to: string, data: DemoData) => {
    console.log(`[Routing] Navigating from ${from} to ${to}`, data);
    // Simulation of history.pushState
    // window.history.pushState({}, '', `?step=${to}`);
  },
  steps: [
    {
      id: "personal",
      label: "Identity",
      validationAdapter: personalAdapter,
    },
    {
      id: "security",
      label: "Security (RAM)",
      validationAdapter: securityAdapter,
      persistenceAdapter: memoryStore, // Override: Keep secrets in RAM only!
    },
    {
      id: "preferences",
      label: "Preferences",
      // No validation
    },
    {
      id: "complete",
      label: "Done",
    },
  ],
};
