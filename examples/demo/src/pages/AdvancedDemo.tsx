import React from "react";
import { WizardStepRenderer } from "wizzard-stepper-react";
import {
  WizardProvider,
  useWizard,
  useWizardActions,
  useWizardValue,
  useWizardError,
  advancedConfig,
} from "../wizards/advanced-wizard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { StepperControls } from "../components/StepperControls";
import { motion, AnimatePresence } from "framer-motion";

// --- Components ---

const DataToolbar = () => {
  const { updateData, clearStorage } = useWizardActions();
  const { currentStep } = useWizard();

  const handleAutofill = () => {
    updateData({
      personal: {
        firstName: "Auto",
        lastName: "Bot",
        email: "autobot@example.com",
      },
      preferences: {
        theme: "dark",
        newsletter: true,
      },
    });
  };

  const handleClear = () => {
    clearStorage();
    window.location.reload();
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 flex justify-between items-center shadow-lg">
      <div className="text-sm">
        <span className="font-bold text-yellow-400">Current Step:</span>{" "}
        {currentStep?.id}
      </div>
      <div className="space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="text-white border-white/20 hover:bg-white/10"
          onClick={handleAutofill}
        >
          🪄 Autofill
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-300 hover:text-red-100"
          onClick={handleClear}
        >
          🗑️ Clear
        </Button>
      </div>
    </div>
  );
};

// Step 1: Personal (Standard)
const PersonalStep = () => {
  const { setData } = useWizardActions();
  const firstName = useWizardValue("personal.firstName");
  const lastName = useWizardValue("personal.lastName");
  const email = useWizardValue("personal.email");

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4 text-sm">
        ℹ️ This step persists to <b>LocalStorage</b>. Try reloading!
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={firstName || ""}
          onChange={(e) => setData("personal.firstName", e.target.value)}
          error={useWizardError("personal.firstName")}
        />
        <Input
          label="Last Name"
          value={lastName || ""}
          onChange={(e) => setData("personal.lastName", e.target.value)}
          error={useWizardError("personal.lastName")}
        />
      </div>
      <Input
        label="Email"
        value={email || ""}
        onChange={(e) => setData("personal.email", e.target.value)}
        error={useWizardError("personal.email")}
      />
    </div>
  );
};

// Step 2: Security (RAM Only)
const SecurityStep = () => {
  const { setData } = useWizardActions();
  const password = useWizardValue("security.password");
  const confirm = useWizardValue("security.confirmPassword");

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded mb-4 text-sm border border-yellow-200">
        🔒 This step uses <b>MemoryAdapter</b>. Data vanishes on reload!
      </div>
      <Input
        label="Password"
        type="password"
        value={password || ""}
        onChange={(e) => setData("security.password", e.target.value)}
        error={useWizardError("security.password")}
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirm || ""}
        onChange={(e) => setData("security.confirmPassword", e.target.value)}
        error={useWizardError("security.confirmPassword")}
      />
    </div>
  );
};

// Step 3: Preferences
const PreferencesStep = () => {
  const { setData, wizardData } = useWizard();

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Preferences</h3>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={!!wizardData.preferences?.newsletter}
          onChange={(e) => setData("preferences.newsletter", e.target.checked)}
          className="rounded text-indigo-600 focus:ring-indigo-500"
        />
        <span>Subscribe to newsletter</span>
      </label>
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-xs font-mono">
          {JSON.stringify(wizardData.preferences, null, 2)}
        </p>
      </div>
    </div>
  );
};

// Step 4: Done
const DoneStep = () => (
  <div className="text-center py-12">
    <div className="text-5xl mb-4">🎉</div>
    <h2 className="text-2xl font-bold">All Set!</h2>
    <p className="text-gray-500">Check the console for `onStepChange` logs.</p>
  </div>
);

// Map components to IDs for the Renderer
// Note: In a real app, you might put `component: PersonalStep` directly in the IStepConfig.
// But we can also use a switch or object map here if we prefer separating config from UI.
// Let's use the Renderer's power by modifying the config on the fly or just following the "Renderer Manual" pattern
// if we didn't put components in config.
// Wait! The user WANTS to see the Renderer used with components in config?
// The library supports `component` in `IStepConfig`.
// Let's update `advanced-wizard.ts` to include them?
// Actually, `WizardStepRenderer` uses `currentStep.component`.
// Since I defined `advancedConfig` in a separate file without React imports, I can't easily put components there
// unless I change extensions or import React there.
// Solution: I will extend the config here in the component to attach components.

const stepsWithComponents = advancedConfig.steps.map((step) => {
  switch (step.id) {
    case "personal":
      return { ...step, component: PersonalStep };
    case "security":
      return { ...step, component: SecurityStep };
    case "preferences":
      return { ...step, component: PreferencesStep };
    case "complete":
      return { ...step, component: DoneStep };
    default:
      return step;
  }
});

const configWithComponents = {
  ...advancedConfig,
  steps: stepsWithComponents,
};

// Animation Wrapper
const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="min-h-[300px]"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const AdvancedWizardInner = () => {
  return (
    <div className="max-w-xl mx-auto py-8">
      <DataToolbar />
      <Card>
        <CardContent className="pt-6">
          {/* Declarative Rendering! */}
          <WizardStepRenderer wrapper={StepWrapper} />
        </CardContent>
        <div className="border-t p-6 bg-gray-50">
          <StepperControls />
        </div>
      </Card>
    </div>
  );
};

export default function AdvancedDemo() {
  return (
    <WizardProvider config={configWithComponents}>
      <AdvancedWizardInner />
    </WizardProvider>
  );
}
