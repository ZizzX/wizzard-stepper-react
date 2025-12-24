import { useWizardContext } from '../context/WizardContext';
import type { IWizardContext } from '../types';

export const useWizard = <T = any>(): IWizardContext<T> => {
  return useWizardContext<T>();
};
