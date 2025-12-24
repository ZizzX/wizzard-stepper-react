import { useWizardContext } from '../context/WizardContext';

export const useWizard = <T = unknown>() => {
    return useWizardContext<T>();
};
