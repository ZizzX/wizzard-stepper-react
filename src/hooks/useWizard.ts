import { useWizardContext } from '../context/WizardContext';
import type { IWizardContext } from '../types';

export const useWizard = <
  T extends Record<string, any> = Record<string, any>,
  StepId extends string = string,
>(): IWizardContext<T, StepId> => {
  return useWizardContext<T, StepId>();
};
