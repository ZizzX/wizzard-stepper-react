# wizzard-stepper-react 🧙‍♂️

A flexible, headless, and strictly typed multi-step wizard library for React. Built with adapter patterns in mind to support any form library (React Hook Form, Formik, etc.) and any validation schema (Zod, Yup).

## Features

- 🧠 **Headless Architecture**: Full control over UI. You bring the components, we provide the logic.
- 🔌 **Adapter Pattern**: Built-in adapters for **Zod**, **Yup** validation, and **LocalStorage/URL/Memory** persistence.
- 🛡️ **Strictly Typed**: Built with TypeScript generics for type safety across steps.
- 🔀 **Conditional Steps**: Dynamic pipelines where steps can be skipped based on data.
- 💾 **Persistence**: Auto-save progress to LocalStorage or custom stores.
- ⚡ **Auto Validation**: Block navigation until the step is valid.

## Installation

```bash
npm install wizzard-stepper-react zod
# or
yarn add wizzard-stepper-react zod
```

## Quick Start (Native Forms)

```tsx
import { WizardProvider, useWizard, IWizardConfig } from 'wizzard-stepper-react';

// 1. Define Config
const config: IWizardConfig = {
  steps: [
    { id: 'personal', label: 'Personal Info' },
    { id: 'contact', label: 'Contact Details' },
  ],
};

// 2. Create Steps
const Step1 = () => {
  const { handleStepChange, wizardData } = useWizard<{ name: string }>();
  return (
    <input 
      value={wizardData.name || ''} 
      onChange={e => handleStepChange('name', e.target.value)} 
    />
  );
};

// 3. Wrap in Provider
export default function App() {
  return (
    <WizardProvider config={config}>
       <WizardContent />
    </WizardProvider>
  );
}

const WizardContent = () => {
  const { currentStep, goToNextStep } = useWizard();
  if(!currentStep) return null;
  return (
    <div>
      {currentStep.id === 'personal' && <Step1 />}
      <button onClick={goToNextStep}>Next</button>
    </div>
  )
}
```

## Integration with React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ZodAdapter, useWizard } from 'wizzard-stepper-react';

const schema = z.object({ email: z.string().email() });

const MyStep = () => {
  const { handleStepChange, wizardData } = useWizard();
  const { register } = useForm({
    defaultValues: wizardData,
    resolver: zodResolver(schema),
    mode: 'onChange' // Important: validate real-time or bind changes
  });

  return (
     <input {...register('email', { 
       onChange: (e) => handleStepChange('email', e.target.value) 
     })} />
  );
}

// In Config:
const config = {
  steps: [
    { 
      id: 'step1', 
      label: 'Email', 
      validationAdapter: new ZodAdapter(schema) // Blocks 'Next' if invalid
    }
  ]
}
```

## Conditional Steps

Steps can be dynamically included based on the wizard's state.

```tsx
const config: IWizardConfig = {
  steps: [
    { id: 'start', label: 'Start' },
    { 
      id: 'bonus', 
      label: 'Bonus Step', 
      // Only show if 'wantBonus' is true
      condition: (data) => !!data.wantBonus 
    }
  ]
}
```

## Persistence

Save progress automatically to LocalStorage to survive page reloads.

```tsx
import { LocalStorageAdapter } from 'wizzard-stepper-react';

const config: IWizardConfig = {
  persistence: {
    mode: 'onChange', // Save on every keystroke
    adapter: new LocalStorageAdapter('my_wizard_prefix_')
  },
  steps: [...]
}
```

## API Reference

### `IWizardConfig<T>`
- `steps`: Array of step configurations.
- `persistence`: Configuration for state persistence.
- `autoValidate`: (obj) Global validation setting.

### `useWizard<T>()`
- `activeSteps`: Steps that match conditions.
- `currentStep`: The currently active step object.
- `wizardData`: The global state object.
- `handleStepChange(key, value)`: Helper to update state.
- `goToNextStep()`: Validates and moves next.
- `goToStep(id)`: Jumps to specific step.
- `allErrors`: Map of validation errors.

## License
MIT
