import {
  WizardProvider,
  useWizard,
  type IWizardConfig,
} from "wizzard-stepper-react";
import { StepperControls } from "../components/StepperControls";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/Card";

// --- Legacy Usage Demonstration ---
// This file demonstrates how the library can still be used without strictly typed factories.
// It relies on implicit 'any' types, similar to older versions of the library.

const Step1 = () => {
  // useWizard<T> defaults to 'any', so wizardData is 'any'
  // No generic passed = no strict type checking
  const { handleStepChange, wizardData } = useWizard();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Legacy Step 1</h2>
        <p className="text-gray-500 text-sm">
          This uses implicit <code>any</code> typing.
        </p>
      </div>
      <Input
        label="Legacy Field"
        placeholder="Type anything..."
        value={wizardData.legacyField || ""}
        onChange={(e) => handleStepChange("legacyField", e.target.value)}
      />
    </div>
  );
};

const Step2 = () => {
  const { wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Legacy Summary</h2>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <pre className="text-xs text-gray-700">
          {JSON.stringify(wizardData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// No generic passed to IWizardConfig either
const wizardConfig: IWizardConfig = {
  steps: [
    { id: "step1", label: "Step 1" },
    { id: "step2", label: "Summary" },
  ],
};

const WizardContent = () => {
  const { currentStep } = useWizard();

  if (!currentStep) return null;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="shadow-xl shadow-yellow-50/50">
        <CardContent className="pt-8">
          {currentStep.id === "step1" && <Step1 />}
          {currentStep.id === "step2" && <Step2 />}
        </CardContent>
        <CardFooter className="pb-8 block">
          <StepperControls />
        </CardFooter>
      </Card>
    </div>
  );
};

export default function LegacyWizard() {
  return (
    <WizardProvider config={wizardConfig}>
      <WizardContent />
    </WizardProvider>
  );
}
