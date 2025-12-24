import React, { useEffect, useCallback } from "react";
import type { IWizardConfig } from "wizzard-stepper-react";
import { ZodAdapter } from "wizzard-stepper-react";
import { StepperControls } from "../components/StepperControls";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import {
  WizardProvider,
  useWizard,
  useWizardValue,
  useWizardActions,
  useWizardError,
  useWizardSelector,
  complexSchema,
  type ComplexFormData,
  type Child,
} from "../wizards/complex-wizard";

// 3. Define Steps using Typed Hooks
const Step1 = React.memo(() => {
  const { setData } = useWizardActions();
  // "parentName" is autocompleted and return type is string
  const parentName = useWizardValue("parentName");

  // Access typed errors
  const { allErrors } = useWizard();
  const errors = allErrors["parent"] || {};

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Parent Info</h2>
        <p className="text-gray-500 text-sm">
          Start with the head of the family.
        </p>
      </div>
      <Input
        label="Your Name"
        placeholder="Jane Doe"
        value={parentName || ""}
        onChange={(e) => setData("parentName", e.target.value)}
        error={errors["parentName"]}
      />
    </div>
  );
});

const ChildRow = React.memo(
  ({
    childId,
    index,
    onRemove,
  }: {
    childId: string;
    index: number;
    onRemove: (id: string) => void;
  }) => {
    const { setData } = useWizardActions();

    // Dot notation paths are autocompleted!
    // "children.0.name"
    const name = useWizardValue(`children.${index}.name`);
    const age = useWizardValue(`children.${index}.age`);

    const nameError = useWizardError(`children.${index}.name`);
    const ageError = useWizardError(`children.${index}.age`);

    return (
      <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 space-y-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          onClick={() => onRemove(childId)}
        >
          Remove
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Child #${index + 1} Name`}
            value={name || ""}
            onChange={(e) => {
              // Fix: ensure sync update to prevent potential timeout/closure issues in prod
              setData(`children.${index}.name`, e.target.value);
            }}
            error={nameError}
          />
          <Input
            label="Age"
            type="number"
            value={age || 0}
            onChange={(e) => {
              setData(`children.${index}.age`, Number(e.target.value));
            }}
            error={ageError}
          />
        </div>
      </div>
    );
  }
);

const Step2 = React.memo(() => {
  const { setData, getData } = useWizardActions();

  // Typed selector: state is correctly inferred as FormData
  const childIds = useWizardSelector((state) =>
    (state.children || []).map((c) => c.id)
  );
  const childrenError = useWizardError("children");

  const addChild = useCallback(() => {
    // getData is also typed!
    const currentChildren = (getData("children") || []) as Child[];
    const newChildren = [
      ...currentChildren,
      { id: crypto.randomUUID(), name: "", age: 0 },
    ];
    setData("children", newChildren);
  }, [setData, getData]);

  const removeChild = useCallback(
    (id: string) => {
      const currentChildren = (getData("children") || []) as Child[];
      const newChildren = currentChildren.filter((c: Child) => c.id !== id);
      setData("children", newChildren);
    },
    [setData, getData]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Children</h2>
        <p className="text-gray-500 text-sm">Add your children's details.</p>
      </div>

      <div className="space-y-4">
        {childIds.map((id, index) => (
          <ChildRow
            key={id}
            childId={id}
            index={index}
            onRemove={removeChild}
          />
        ))}

        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={addChild}
        >
          + Add Child
        </Button>
        {childrenError && (
          <p className="text-red-500 text-xs mt-1">{childrenError}</p>
        )}
      </div>
    </div>
  );
});

const Step3 = React.memo(() => {
  const { wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
        <p className="text-gray-500 text-sm">JSON state of your wizard.</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <pre className="text-xs text-gray-700 leading-relaxed overflow-auto">
          {JSON.stringify(wizardData, null, 2)}
        </pre>
      </div>
    </div>
  );
});

// 4. Config matches FormData
const wizardConfig: IWizardConfig<ComplexFormData> = {
  steps: [
    {
      id: "parent",
      label: "Parent",
      validationAdapter: new ZodAdapter(
        complexSchema.pick({ parentName: true })
      ),
    },
    {
      id: "children",
      label: "Children",
      validationAdapter: new ZodAdapter(complexSchema.pick({ children: true })),
    },
    { id: "summary", label: "Summary" },
  ],
};

const WizardInner = () => {
  const { currentStep, goToNextStep, isLastStep, clearStorage } = useWizard();

  useEffect(() => {
    return () => {
      clearStorage();
    };
  }, [clearStorage]);

  if (!currentStep) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastStep) {
      clearStorage();
    } else {
      await goToNextStep();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl shadow-indigo-50/50">
          <CardContent className="pt-8">
            {currentStep.id === "parent" && <Step1 />}
            {currentStep.id === "children" && <Step2 />}
            {currentStep.id === "summary" && <Step3 />}
          </CardContent>
          <CardFooter className="pb-8 block">
            <StepperControls />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default function ComplexDataWizard() {
  return (
    <WizardProvider config={wizardConfig}>
      <WizardInner />
    </WizardProvider>
  );
}
