import { WizardProvider, useWizard } from "../../wizards/docs-wizard";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { StepperControls } from "../../components/StepperControls";
import { LocalStorageAdapter } from "wizzard-stepper-react";

const TutorialStep1 = () => {
  const { wizardData, handleStepChange } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Step 1: The Context</h3>
        <p className="text-gray-600">
          First, we create a specialized context using <code className="text-indigo-600">createWizardFactory</code>. This gives you typesafe hooks.
        </p>
      </div>
      <Input
        label="What is your name?"
        value={wizardData.userName || ""}
        onChange={(e) => handleStepChange("userName", e.target.value)}
        placeholder="Enter your name..."
      />
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 italic text-sm text-indigo-700">
        "Note how the UI is completely yours. I'm just a standard Input component."
      </div>
    </div>
  );
};

const TutorialStep2 = () => {
  const { wizardData, handleStepChange } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Step 2: Handles Complexity</h3>
        <p className="text-gray-600">
          The factory manages state and transitions. You can handle checkboxes, nested objects, or even file uploads.
        </p>
      </div>
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <input
          type="checkbox"
          id="react"
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={!!wizardData.knowsReact}
          onChange={(e) => handleStepChange("knowsReact", e.target.checked)}
        />
        <label htmlFor="react" className="font-medium text-gray-900">
          Do you know React?
        </label>
      </div>
    </div>
  );
};

const TutorialStep3 = () => {
  const { wizardData } = useWizard();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Step 3: Review & Submit</h3>
        <p className="text-gray-600">
          All your data is centrally managed and ready to be sent to your API.
        </p>
      </div>
      <div className="bg-gray-950 rounded-xl p-6 font-mono text-sm shadow-inner overflow-auto">
        <pre className="text-indigo-400">
          {JSON.stringify(wizardData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const TutorialContent = () => {
  const { currentStep, currentStepIndex } = useWizard();
  if (!currentStep) return null;

  return (
    <div className="space-y-8">
      <Card className="border-2 border-indigo-100 shadow-xl overflow-hidden bg-white">
        <div className="h-1 bg-indigo-100 w-full overflow-hidden">
           <div 
             className="h-full bg-indigo-600 transition-all duration-500" 
             style={{ width: `${(currentStepIndex + 1) * 33.33}%` }} 
           />
        </div>
        <CardContent className="p-8">
           {currentStep.id === "step1" && <TutorialStep1 />}
           {currentStep.id === "step2" && <TutorialStep2 />}
           {currentStep.id === "step3" && <TutorialStep3 />}
           
           <div className="mt-8 pt-6 border-t border-gray-100">
              <StepperControls />
           </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">Wait, how was this built?</h3>
        <p className="text-gray-600 leading-relaxed">
          The window above is actually running <code className="text-indigo-600">wizzard-stepper-react</code>! It uses LocalStorage to remember your name if you refresh, and it handles the active step state automatically.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Read the Docs Below ↓
        </Button>
      </div>
    </div>
  );
};

export default function QuickStart() {
  const config = {
    steps: [
      { id: "step1", label: "Intro" },
      { id: "step2", label: "Skills" },
      { id: "step3", label: "Review" },
    ],
    persistence: {
        mode: 'onChange' as const,
        adapter: new LocalStorageAdapter("tutorial_"),
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Quick Start
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Learn by doing. Try out this interactive example built using the library.
        </p>
      </div>

      <WizardProvider config={config}>
        <TutorialContent />
      </WizardProvider>

      <section className="space-y-6 pt-10 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Basic Usage</h2>
        <p className="text-gray-600">
          To get started, create a wizard context and wrap your application (or a part of it) in a provider.
        </p>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-2xl">
          <pre className="text-indigo-300">
{`import { createWizardFactory } from 'wizzard-stepper-react';

// 1. Create a schema for your data
interface MyData { name: string; }

// 2. Create the factory
const { WizardProvider, useWizard } = createWizardFactory<MyData>();

// 3. Use it in your components
const MyWizard = () => {
  const { wizardData, handleStepChange } = useWizard();
  
  return (
    <input 
      value={wizardData.name} 
      onChange={e => handleStepChange('name', e.target.value)} 
    />
  );
};

// 4. Wrap with Provider
export default function App() {
  return (
    <WizardProvider config={{ steps: [{ id: 'step1', label: 'Start' }] }}>
       <MyWizard />
    </WizardProvider>
  );
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}
