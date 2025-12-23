import { WizardProvider, useWizard, type IWizardConfig, ZodAdapter } from 'wizzard-stepper-react';
import { z } from 'zod';
import { StepperControls } from '../components/StepperControls';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter } from '../components/ui/Card';

// 1. Define Schema with nested arrays
const schema = z.object({
  parentName: z.string().min(1, 'Parent name is required'),
  children: z.array(z.object({
    name: z.string().min(1, 'Child name is required'),
    age: z.coerce.number().min(0, 'Age must be positive')
  })).min(1, 'At least one child is required')
});

type FormData = z.infer<typeof schema>;

// 2. Define Steps
const Step1 = () => {
  const { setData, wizardData, allErrors } = useWizard<FormData>();
  const errors = allErrors['parent'] || {};

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Parent Info</h2>
        <p className="text-gray-500 text-sm">Start with the head of the family.</p>
      </div>
      <Input
        label="Your Name"
        placeholder="Jane Doe"
        value={wizardData.parentName || ''}
        onChange={(e) => setData('parentName', e.target.value)}
        error={errors['parentName']}
      />
    </div>
  );
};

const Step2 = () => {
  const { setData, wizardData, allErrors } = useWizard<FormData>();
  const errors = allErrors['children'] || {};
  const children = wizardData.children || [];

  const addChild = () => {
    const newChildren = [...children, { name: '', age: 0 }];
    setData('children', newChildren);
  };

  const removeChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    setData('children', newChildren);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Children</h2>
        <p className="text-gray-500 text-sm">Add your children's details.</p>
      </div>

      <div className="space-y-4">
        {children.map((child, index) => (
          <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 space-y-4 relative">
            <Button 
               variant="ghost" 
               size="sm" 
               className="absolute top-2 right-2 text-red-500 hover:text-red-700" 
               onClick={() => removeChild(index)}
            >
              Remove
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={`Child #${index + 1} Name`}
                value={child.name}
                onChange={(e) => setData(`children[${index}].name`, e.target.value)}
                error={errors[`children.${index}.name`]}
              />
              <Input
                label="Age"
                type="number"
                value={child.age}
                onChange={(e) => setData(`children[${index}].age`, e.target.value)}
                error={errors[`children.${index}.age`]}
              />
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full border-dashed" onClick={addChild}>
          + Add Child
        </Button>
        {errors['children'] && <p className="text-red-500 text-xs mt-1">{errors['children']}</p>}
      </div>
    </div>
  );
};

const Step3 = () => {
  const { wizardData } = useWizard<FormData>();
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
};

// 3. Define Config
const wizardConfig: IWizardConfig<FormData> = {
  steps: [
    { 
      id: 'parent', 
      label: 'Parent', 
      validationAdapter: new ZodAdapter(schema.pick({ parentName: true })) 
    },
    { 
      id: 'children', 
      label: 'Children', 
      validationAdapter: new ZodAdapter(schema.pick({ children: true })) 
    },
    { id: 'summary', label: 'Summary' },
  ],
};

// 4. Wizard Wrapper with Global Form
const WizardInner = () => {
  const { currentStep, goToNextStep, isLastStep } = useWizard<FormData>();

  if (!currentStep) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastStep) {
      alert('Wizard Completed!');
    } else {
      await goToNextStep();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl shadow-indigo-50/50">
          <CardContent className="pt-8">
            {currentStep.id === 'parent' && <Step1 />}
            {currentStep.id === 'children' && <Step2 />}
            {currentStep.id === 'summary' && <Step3 />}
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
