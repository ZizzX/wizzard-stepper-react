# Migration Guide

## Upgrading to v2.0 (Strict Typing)

We have introduced a **Factory Pattern** to provide 100% type safety. While the classic usage still works, we strongly recommend migrating to the factory pattern for better developer experience.

### 1. Classic Usage (No Change Required)

Your existing code will continue to work. `useWizard` now defaults to `any` instead of `unknown`, ensuring no immediate breakages.

```tsx
// This still works!
const { wizardData } = useWizard(); // wizardData is any
```

### 2. Migrating to Factory Pattern (Recommended)

To get full type inference and autocomplete, move your wizard creation to a shared factory file.

#### Step 1: Create a Wizard Definition

Create a file (e.g., `src/wizards/my-wizard.ts`) and define your schema.

```typescript
import { createWizardFactory } from 'wizzard-stepper-react';
import { z } from 'zod';

const schema = z.object({
  firstName: z.string(),
  age: z.number(),
});

export type MySchema = z.infer<typeof schema>;

// 🪄 Create the factory
export const {
  WizardProvider,
  useWizard,
  useWizardValue,
  createStep
} = createWizardFactory<MySchema>();
```

#### Step 2: Update Your Components

Replace imports from `wizzard-stepper-react` with imports from your new file.

```diff
- import { useWizard } from 'wizzard-stepper-react';
+ import { useWizard } from '../wizards/my-wizard';

const Step1 = () => {
- const { wizardData } = useWizard<MySchema>(); // Manual generic
+ const { wizardData } = useWizard(); // 🪄 Automatically typed!
  
  // TypeScript knows this is a string
  console.log(wizardData.firstName); 
}
```

### 3. Updating Validation Adapters

If you implemented custom validation adapters, update `validate(data: T)` to `validate(data: unknown)`.

```typescript
class MyValidator implements IValidatorAdapter<MySchema> {
- validate(data: MySchema) {
+ validate(data: unknown) {
+   const typedData = data as MySchema; // Cast internally
    // ... validate typedData
  }
}
```
