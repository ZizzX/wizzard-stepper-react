# wizzard-stepper-react 🧙‍♂️

[![npm version](https://img.shields.io/npm/v/wizzard-stepper-react.svg)](https://www.npmjs.com/package/wizzard-stepper-react)
[![license](https://img.shields.io/npm/l/wizzard-stepper-react.svg)](https://github.com/ZizzX/wizzard-stepper-react/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/wizzard-stepper-react)](https://bundlephobia.com/package/wizzard-stepper-react)

A flexible, headless, and strictly typed multi-step wizard library for React. Built with adapter patterns in mind to support any form library (React Hook Form, Formik, etc.) and any validation schema (Zod, Yup).

---

## 🚀 Quick Start (v2.0.0 Modern)

Version 2.0.0 introduces the **Factory Pattern**, providing 100% type safety and optimized performance out of the box.

### 1. Create your Wizard Kit

Define your data schema and generate typed hooks.

```typescript
// wizards/auth-wizard.ts
import { createWizardFactory } from 'wizzard-stepper-react';

interface AuthSchema {
  email: string;
  preferences: { theme: 'light' | 'dark' };
}

export const { 
  WizardProvider, 
  useWizard, 
  useWizardValue, 
  useWizardActions 
} = createWizardFactory<AuthSchema>();
```

### 2. Wrap your App

```tsx
import { WizardProvider } from './wizards/auth-wizard';

const App = () => (
  <WizardProvider>
    <MyWizardComponents />
  </WizardProvider>
);
```

### 3. Use Granular Hooks

```tsx
import { useWizardValue, useWizardActions } from './wizards/auth-wizard';

const EmailInput = () => {
  // ⚡ Atomic re-render: component only updates if 'email' changes
  const email = useWizardValue('email');
  const { setData } = useWizardActions();

  return <input value={email} onChange={e => setData('email', e.target.value)} />;
};
```

---

## ✨ Key Features

- 🧠 **Headless Architecture**: Full control over UI. You bring the components, we provide the logic.
- 💅 **Modern First**: Requires React 18+ (built on `useSyncExternalStore`) for selective rendering and an external state store.
- 🔌 **Adapter Pattern**: Zero-dependency adapters for **Zod**, **Yup** validation.
- 🏗️ **Complex Data**: Built-in support for nested objects using dot notation (`user.address.zip`).
- 💾 **Advanced Persistence**: Auto-save to LocalStorage, SessionStorage, or Custom API adapters.
- 🛠️ **Developer Tools**: High-performance debugging overlay and **Redux DevTools** integration.

---

## 🏗️ Core Concepts

### Validation Adapters

We are library-agnostic. Use our pre-built adapters or write your own.

```tsx
import { ZodAdapter } from 'wizzard-stepper-react';
import { z } from 'zod';

const schema = z.object({ age: z.number().min(18) });
const adapter = new ZodAdapter(schema);

// In your config:
const step = { id: 'age', validationAdapter: adapter };
```

### Navigation Lifecycle

1. **Validation**: Current step is checked. Navigation stops if invalid.
2. **Resolution**: Next step conditions (dynamic branching) are evaluated.
3. **Guards**: `beforeLeave` hooks run (e.g., for "Unsaved Changes" modals).
4. **Commit**: State updates and navigation completes.

---

## 💾 State Persistence

Isolate your wizard data to prevent collisions when using multiple instances.

```typescript
import { LocalStorageAdapter } from 'wizzard-stepper-react';

const config = {
  persistence: {
    // 🛡️ Always use a unique prefix for isolation
    adapter: new LocalStorageAdapter('auth_wizard_v2'),
    mode: 'onStepChange' 
  }
};
```

---

## 🛠️ Performance Tuning

| Hook | Returns | Re-renders | Best For |
| :--- | :--- | :--- | :--- |
| `useWizardActions` | Navigation/Setters | **Zero** | Buttons, Handlers |
| `useWizardValue` | Specific Field | **Atomic** | Inputs, Labels |
| `useWizardState` | UI Meta (Progress) | **Minimal** | Progress Bars |
| `useWizard` | Everything | **Full** | Orchestration |

---

## ⚠️ Legacy Support (v1.x)

If you are maintaining an older project, you can still use the classic Context-based provider. Note that this mode does not support the new performance-optimized hooks.

```tsx
import { WizardProvider, useWizard } from 'wizzard-stepper-react';

const OldApp = () => (
  <WizardProvider>
    <MyComponents />
  </WizardProvider>
);
```

For migration steps, see [MIGRATION.md](./MIGRATION.md).

---

## 📄 Documentation & Demos

- 📚 **Full Docs**: [Interactive Documentation Portal](https://ZizzX.github.io/wizzard-stepper-react/)
- 🧪 **Enterprise Demo**: [Google-quality complex wizard implementation](https://ZizzX.github.io/wizzard-stepper-react/docs/introduction)
- 🚀 **NPMS**: [View on npm](https://www.npmjs.com/package/wizzard-stepper-react)

---

## License

MIT © [ZizzX](https://github.com/ZizzX)
