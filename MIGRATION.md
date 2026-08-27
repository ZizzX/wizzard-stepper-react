# Migration Guide

## v3.0.0

### Breaking: React 18 is now required

`peerDependencies` previously advertised `react >= 16.8.0`, but the provider has
been built on `useSyncExternalStore` since v2 — a React 18 API. On React 16/17 the
package installed cleanly and then crashed on the first render.

The range now says what the code actually needs:

```diff
- "react": ">=16.8.0"
+ "react": ">=18.0.0"
```

Nothing in the public API changed: every export, type and signature is identical
to `2.0.1`. If you are already on React 18 or 19, upgrading is a drop-in
replacement and requires no code changes.

### Behaviour fixes included in this release

These were bugs, not features — but if you worked around one of them, the
workaround is now redundant:

- **`clearData` now actually clears.** Its result used to be computed and then
  discarded before reaching the store.
- **`dependsOn` matches bracket paths.** A step declaring `dependsOn: ['items']`
  now reacts to `setData('items[0].name', ...)`.
- **Persisted navigation state is restored.** The stored `currentStepId` is no
  longer overwritten by the first step on mount, and re-hydration no longer
  resurrects steps that `dependsOn` had just invalidated.
- **A throwing validation adapter no longer wipes existing error messages.**
- **`updateData` preserves `Date`, `Map`, `Set` and `undefined`.** It used to
  deep-clone through `JSON.parse(JSON.stringify(...))`. Nested objects are now
  shared by reference instead of cloned; the library never mutates them.
- **`onChange` validation is debounced per step** instead of through one shared
  timer that let an edit on one step cancel another step's pending validation.
- **`window.scrollTo` is guarded** for non-browser environments.
- **`VALIDATE_END` carries the real validation result**, so middleware and
  Redux DevTools no longer see a hardcoded `{ isValid: true }`.


## Upgrading to v1.8.0 (Internal Refactoring & Analytics)

This version introduces internal refactoring to clarify the distinction between the Wizard Handle and the underlying Store, along with standardized analytics.

### 1. Renaming `IWizardStore` to `IWizardHandle` [BREAKING IF TYPED]

If you were explicitly importing and using the `IWizardStore` type from `wizzard-stepper-react` (usually when passing the whole wizard object as a prop), you must rename it to `IWizardHandle`.

```diff
- import { IWizardStore } from 'wizzard-stepper-react';
+ import { IWizardHandle } from 'wizzard-stepper-react';

- function MyComponent({ wizard }: { wizard: IWizardStore }) { ... }
+ function MyComponent({ wizard }: { wizard: IWizardHandle }) { ... }
```

> [!NOTE]
> The name `IWizardStore` is now used for the internal store class interface.

### 2. Signature changes for `condition` and `beforeLeave` [BREAKING]

The callback signatures have been updated to provide easier access to the wizard's global state and errors.

**Old signature:**
`condition?: (data: T) => boolean`
`beforeLeave?: (data: T, direction: StepDirection) => boolean`

**New signature:**
`condition?: (data: T, metadata: StepMetadata<T, StepId>) => boolean`
`beforeLeave?: (data: T, direction: StepDirection, metadata: StepMetadata<T, StepId>) => boolean`

**Migration example:**
```diff
- condition: (data) => data.age > 18,
+ condition: (data, { wizardData }) => wizardData.age > 18,
```

### 3. Analytics standardisation

The `analytics.onEvent` setting is now strictly typed. If you were using a generic `(name: string, payload: any)` handler, it will still work but you can now benefit from autocomplete.

---

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
