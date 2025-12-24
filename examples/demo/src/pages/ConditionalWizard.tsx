import {
  WizardProvider,
  useWizard,
  type IWizardConfig,
} from "wizzard-stepper-react";
import { useEffect } from "react";
import { StepperControls } from "../components/StepperControls";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { cn } from "../lib/utils";

// Conditional Logic Steps

const Step1 = () => {
  const { handleStepChange, wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Step Routing</h2>
        <p className="text-gray-500 text-sm">
          Decide which steps you want to see.
        </p>
      </div>

      <label className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id="hasCoApplicant"
            className="peer h-6 w-6 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 transition-all"
            checked={!!wizardData.hasCoApplicant}
            onChange={(e) =>
              handleStepChange("hasCoApplicant", e.target.checked)
            }
          />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
            Add Co-Applicant
          </p>
          <p className="text-sm text-gray-500">
            Enable this to show an additional info step.
          </p>
        </div>
      </label>
    </div>
  );
};

const StepCoApplicant = () => {
  const { handleStepChange, wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Co-Applicant Info</h2>
        <p className="text-gray-500 text-sm">
          Enter the details for the second person.
        </p>
      </div>
      <Input
        label="Full Name"
        placeholder="Jane Smith"
        value={wizardData.coApplicantName || ""}
        onChange={(e) => handleStepChange("coApplicantName", e.target.value)}
      />
    </div>
  );
};

const StepFinal = () => {
  const { wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ⚡
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Flow Complete</h2>
        <p className="text-gray-500">
          The wizard adjusted based on your selections.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Final Data
        </p>
        <pre className="text-xs text-gray-700 leading-relaxed overflow-auto">
          {JSON.stringify(wizardData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const wizardConfig: IWizardConfig = {
  steps: [
    { id: "start", label: "Flow Control" },
    {
      id: "co-applicant",
      label: "Co-Applicant",
      condition: (data: any) => !!data.hasCoApplicant,
    },
    { id: "final", label: "Finalizing" },
  ],
};

const WizardContent = () => {
  const { currentStep, activeSteps, clearStorage } = useWizard();

  useEffect(() => {
    return () => {
      clearStorage();
    };
  }, [clearStorage]);

  if (!currentStep) return null;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-8 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {activeSteps.map((s: any, idx: number) => {
            const isActive = s.id === currentStep.id;
            return (
              <div key={s.id} className="flex items-center shrink-0">
                <div
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-50"
                      : "bg-gray-50 text-gray-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                      isActive ? "bg-white/20" : "bg-gray-200"
                    )}
                  >
                    {idx + 1}
                  </span>
                  {isActive ? s.label : s.label.split(" ")[0]}
                </div>
                {idx < activeSteps.length - 1 && (
                  <div className="w-4 h-px bg-gray-200 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="shadow-xl shadow-indigo-50/50">
        <CardContent className="pt-8">
          {currentStep.id === "start" && <Step1 />}
          {currentStep.id === "co-applicant" && <StepCoApplicant />}
          {currentStep.id === "final" && <StepFinal />}
        </CardContent>
        <CardFooter className="pb-8 block">
          <StepperControls />
        </CardFooter>
      </Card>
    </div>
  );
};

export default function ConditionalWizard() {
  return (
    <WizardProvider config={wizardConfig}>
      <WizardContent />
    </WizardProvider>
  );
}
