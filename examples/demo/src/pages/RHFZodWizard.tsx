import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  WizardProvider,
  useWizard,
  step1Schema,
  step2Schema,
} from "../wizards/rhf-zod-wizard";
import type { IWizardConfig } from "wizzard-stepper-react";
import { ZodAdapter, LocalStorageAdapter } from "wizzard-stepper-react";
import { useEffect } from "react";
import { StepperControls } from "../components/StepperControls";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import type { RHFZodSchema } from "../wizards/rhf-zod-wizard";

// --- Components ---

const Step1 = () => {
  const { handleStepChange, wizardData, allErrors } = useWizard();
  const { register } = useForm({
    defaultValues: wizardData,
    resolver: zodResolver(step1Schema),
    mode: "onChange",
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Account Info</h2>
        <p className="text-gray-500 text-sm">
          Create your credentials using RHF + Zod.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Username"
          placeholder="johndoe"
          error={allErrors.account?.["username"]}
          {...register("username", {
            onChange: (e) => handleStepChange("username", e.target.value),
          })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={allErrors.account?.["email"]}
          {...register("email", {
            onChange: (e) => handleStepChange("email", e.target.value),
          })}
        />
      </div>
    </div>
  );
};

const Step2 = () => {
  const { handleStepChange, wizardData, allErrors } = useWizard();
  const { register } = useForm({
    defaultValues: wizardData,
    resolver: zodResolver(step2Schema),
    mode: "onChange",
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Security</h2>
        <p className="text-gray-500 text-sm">
          Protect your account with a strong password.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={allErrors.security?.["password"]}
          {...register("password", {
            onChange: (e) => handleStepChange("password", e.target.value),
          })}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={allErrors.security?.["confirmPassword"]}
          {...register("confirmPassword", {
            onChange: (e) =>
              handleStepChange("confirmPassword", e.target.value),
          })}
        />
      </div>
    </div>
  );
};

// --- Config ---
const wizardConfig: IWizardConfig<RHFZodSchema> = {
  persistence: {
    mode: "onChange",
    adapter: new LocalStorageAdapter("rhf_wizard_"),
  },
  steps: [
    {
      id: "account",
      label: "Account",
      validationAdapter: new ZodAdapter(step1Schema),
    },
    {
      id: "security",
      label: "Security",
      validationAdapter: new ZodAdapter(step2Schema),
    },
    { id: "review", label: "Done" },
  ],
};

const WizardContent = () => {
  const { currentStep, wizardData, clearStorage } = useWizard();

  useEffect(() => {
    return () => {
      clearStorage();
    };
  }, [clearStorage]);

  if (!currentStep) return null;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="shadow-xl shadow-indigo-50/50">
        <CardContent className="pt-8">
          {currentStep.id === "account" && <Step1 />}
          {currentStep.id === "security" && <Step2 />}
          {currentStep.id === "review" && (
            <div className="space-y-6">
              <div className="space-y-2 text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Registration Complete
                </h2>
                <p className="text-gray-500">
                  Your account has been successfully configured.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <pre className="text-xs text-gray-700 leading-relaxed overflow-auto">
                  {JSON.stringify(wizardData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pb-8 block">
          <StepperControls />
        </CardFooter>
      </Card>
    </div>
  );
};

export default function RHFZodWizard() {
  return (
    <WizardProvider config={wizardConfig}>
      <WizardContent />
    </WizardProvider>
  );
}
