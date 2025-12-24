# wizzard-stepper-react 🧙‍♂️

A flexible, headless, and strictly typed multi-step wizard library for React. Built with adapter patterns in mind to support any form library (React Hook Form, Formik, etc.) and any validation schema (Zod, Yup).

## Features

- 🧠 **Headless Architecture**: Full control over UI. You bring the components, we provide the logic.
- 🔌 **Adapter Pattern**: Zero-dependency adapters for **Zod**, **Yup** validation. No hard dependencies on these libraries in the core.
- 🏗️ **Complex Data**: Built-in support for nested objects and arrays using dot notation (`users[0].name`).
- 🛡️ **Strictly Typed**: Built with TypeScript generics for type safety across steps.
- 🔀 **Conditional Steps**: Dynamic pipelines where steps can be skipped based on data.
- 💾 **Persistence**: Auto-save progress to LocalStorage or custom stores.
- ⚡ **Auto Validation**: Block navigation until the step is valid.

## Installation

```bash
npm install wizzard-stepper-react
# or
yarn add wizzard-stepper-react
# or
pnpm add wizzard-stepper-react
```

## Usage

### 1. Basic Usage (Compatible & Simple)

The quickest way to get started. Types are flexible (`any`).

```tsx
import { WizardProvider, useWizard } from 'wizzard-stepper-react';

const Step1 = () => {
  const { wizardData, handleStepChange } = useWizard();
  return (
    <input 
      value={wizardData.name} 
      onChange={(e) => handleStepChange('name', e.target.value)} 
    />
  );
};

const App = () => (
  <WizardProvider>
    <Step1 />
  </WizardProvider>
);
```

### 2. Strict Usage (Factory Pattern 🏭)

For production apps, use the factory pattern to get perfect type inference.

**`wizards/my-wizard.ts`**
```typescript
import { createWizardFactory } from 'wizzard-stepper-react';

interface MySchema {
  name: string;
  age: number;
}

export const { WizardProvider, useWizard } = createWizardFactory<MySchema>();
```

**`components/MyForm.tsx`**
```tsx
import { useWizard } from '../wizards/my-wizard';

const Step1 = () => {
  const { wizardData } = useWizard();
  // ✅ wizardData is strictly typed as MySchema
  // ✅ Autocomplete works for wizardData.name
}
```

See [MIGRATION.md](./MIGRATION.md) for details on switching to strict mode.

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
      // Zero-dependency: works with any Zod version
      validationAdapter: new ZodAdapter(schema) 
    }
  ]
}
```

## Complex Data (Arrays & Objects)

The library provides `setData` and `getData` helpers that support deep paths using dot notation and array brackets.

```tsx
const { setData, wizardData } = useWizard<MyData>();

// Set nested object property
setData('user.profile.name', 'John');

// Set array item property
setData('items[0].value', 'New Value');

// Get with default value
const name = getData('user.profile.name', 'Anonymous');
```

## Performance & Optimization 🚀

For large forms (e.g., 50+ array items), using `useWizard` context can cause performance issues because it triggers a re-render on every keystroke. To solve this, we provide **granular hooks** that allow components to subscribe only to the specific data they need.

### 1. Use `useWizardValue` for Granular Updates

Instead of reading the whole `wizardData`, subscribe to a single field. The component will only re-render when *that specific field* changes.

```tsx
// ✅ FAST: Only re-renders when "users[0].name" changes
const NameInput = () => {
  // Subscribe to specific path
  const name = useWizardValue('users[0].name'); 
  const { setData } = useWizardActions(); // Component actions don't trigger re-renders
  
  return <input value={name} onChange={e => setData('users[0].name', e.target.value)} />;
}

// ❌ SLOW: Re-renders on ANY change in the form
const NameInputSlow = () => {
  const { wizardData, setData } = useWizard();
  return <input value={wizardData.users[0].name} ... />;
}
```

### 2. Use `useWizardSelector` for Lists

When rendering lists, avoid passing the whole `children` array to the parent component. Instead, select only IDs and let child components fetch their own data.

```tsx
const ChildrenList = () => {
  // ✅ Only re-renders when the list LENGTH changes or IDs change
  const childIds = useWizardSelector(state => state.children.map(c => c.id));
  
  return (
    <div>
      {childIds.map((id, index) => (
         // Pass ID/Index, NOT the data object
        <ChildRow key={id} index={index} />
      ))}
    </div>
  );
}
```

### 3. Debounced Validation

For heavy validation schemas, you can debounce validation to keep the UI responsive.

```tsx
setData('field.path', value, { 
  debounceValidation: 300 // Wait 300ms before running Zod/Yup validation
});
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
- `wizardData`: The global state object (subscribe cautiously!).
- `setData(path, value, options?)`: Update state. Options: `{ debounceValidation: number }`.
- `getData(path, defaultValue?)`: Retrieve nested data.
- `handleStepChange(key, value)`: simple helper to update top-level state.
- `goToNextStep()`: Validates and moves next.
- `goToStep(id)`: Jumps to specific step.
- `allErrors`: Map of validation errors.

### New Performance Hooks

#### `useWizardValue<T>(path: string)`

Subscribes to a specific data path. Re-renders **only** when that value changes.

#### `useWizardError(path: string)`

Subscribes to validation errors for a specific path. Highly recommended for individual inputs.

#### `useWizardSelector<T>(selector: (state: T) => any)`

Create a custom subscription to the wizard state. Ideal for derived state or lists.

#### `useWizardActions()`

Returns object with actions (`setData`, `goToNextStep`, etc.) **without** subscribing to state changes. Use this in components that trigger updates but don't need to render data.

## Demos

Check out the [Live Demo](https://ZizzX.github.io/wizzard-stepper-react/), [NPM](https://www.npmjs.com/package/wizzard-stepper-react) or the [source code](https://github.com/ZizzX/wizzard-stepper-react-demo) for a complete implementation featuring:

- **Tailwind CSS v4** UI overhaul.
- **React Hook Form + Zod** integration.
- **Formik + Yup** integration.
- **Conditional Routing** logic.

## License

MIT
