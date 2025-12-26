import { describe, it, expect, vi } from 'vitest';
import { WizardStore } from './context/WizardContext';
import { IWizardConfig } from './types';

const mockConfig: IWizardConfig<any, any> = {
  steps: [{ id: 'step1', label: 'Step 1' }],
};

describe('WizardStore', () => {
  it('should update state and notify listeners when setData is called', () => {
    const store = new WizardStore(mockConfig, { name: 'John', age: 30 });
    const listener = vi.fn();
    store.subscribe(listener);

    const snapshot1 = store.getSnapshot();
    expect(snapshot1.data).toEqual({ name: 'John', age: 30 });

    store.setData('age', 31);

    expect(listener).toHaveBeenCalled();
    const snapshot2 = store.getSnapshot();
    expect(snapshot2.data).toEqual({ name: 'John', age: 31 });
    expect(snapshot2.data).not.toBe(snapshot1.data); // Reference change
  });
});
