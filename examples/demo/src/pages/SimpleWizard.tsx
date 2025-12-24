import { WizardProvider, useWizard } from "../wizards/simple-wizard";
import type {
  IWizardConfig,
  IValidatorAdapter,
  ValidationResult,
} from "wizzard-stepper-react";
import { LocalStorageAdapter } from "wizzard-stepper-react";
import { useEffect } from "react";
import { StepperControls } from "../components/StepperControls";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import type { SimpleWizardSchema } from "../wizards/simple-wizard";

// --- Custom Validator Implementation ---
// This demonstrates how users can easily create their own validation logic
// without incorrectly relying on 3rd party libraries if they prefer simple JS checks.
class SimpleValidator<T> implements IValidatorAdapter<T> {
  private validateFn: (data: T) => Record<string, string>;

  constructor(validateFn: (data: T) => Record<string, string>) {
    this.validateFn = validateFn;
  }

  async validate(data: unknown): Promise<ValidationResult> {
    // You can also make this async (e.g., check username on server)
    const errors = this.validateFn(data as T);
    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }
}

// 1. Define Fields/Steps
const Step1 = () => {
  const { handleStepChange, wizardData, allErrors } = useWizard();
  // Errors for this step are stored under the step ID ('personal')
  const errors = allErrors["personal"] || {};

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Personal Info</h2>
        <p className="text-gray-500 text-sm">
          Please tell us a bit about yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          placeholder="John"
          value={wizardData.firstName || ""}
          onChange={(e) => handleStepChange("firstName", e.target.value)}
          error={errors["firstName"]}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={wizardData.lastName || ""}
          onChange={(e) => handleStepChange("lastName", e.target.value)}
          error={errors["lastName"]}
        />
      </div>
    </div>
  );
};

const Step2 = () => {
  const { handleStepChange, wizardData, allErrors } = useWizard();
  const errors = allErrors["contact"] || {};

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
        <p className="text-gray-500 text-sm">How can we reach you?</p>
      </div>
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        value={wizardData.email || ""}
        onChange={(e) => handleStepChange("email", e.target.value)}
        error={errors["email"]}
      />
    </div>
  );
};

const Step3 = () => {
  const { wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Review</h2>
        <p className="text-gray-500 text-sm">
          Check your information before submitting.
        </p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <pre className="text-xs text-gray-700 leading-relaxed overflow-auto">
          {JSON.stringify(wizardData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// 2. Define Validators
const personalValidator = new SimpleValidator<SimpleWizardSchema>((data) => {
  const errors: Record<string, string> = {};
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  return errors;
});

const contactValidator = new SimpleValidator<SimpleWizardSchema>((data) => {
  const errors: Record<string, string> = {};
  if (!data.email) errors.email = "Email address is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = "Please enter a valid email";
  return errors;
});

// 3. Define Config
const wizardConfig: IWizardConfig<SimpleWizardSchema> = {
  persistence: {
    mode: "onChange",
    adapter: new LocalStorageAdapter("simple_wizard_"),
  },
  steps: [
    {
      id: "personal",
      label: "Personal Info",
      validationAdapter: personalValidator,
    },
    {
      id: "contact",
      label: "Contact",
      validationAdapter: contactValidator,
    },
    { id: "review", label: "Review" },
  ],
};

// 4. Main Wrapper
const WizardContent = () => {
  const { currentStep, clearStorage } = useWizard();

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
          {currentStep.id === "personal" && <Step1 />}
          {currentStep.id === "contact" && <Step2 />}
          {currentStep.id === "review" && <Step3 />}
        </CardContent>
        <CardFooter className="pb-8 block">
          <StepperControls />
        </CardFooter>
      </Card>
    </div>
  );
};

export default function SimpleWizard() {
  return (
    <WizardProvider config={wizardConfig}>
      <WizardContent />
    </WizardProvider>
  );
}
