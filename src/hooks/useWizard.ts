import { useWizardContext } from '../context/WizardContext';

export const useWizard = <T = any>() => {
    return useWizardContext<T>();
};
