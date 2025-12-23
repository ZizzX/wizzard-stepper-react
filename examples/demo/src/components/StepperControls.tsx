import { useWizard } from 'wizzard-stepper-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

export const StepperControls = () => {
  const {
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPrevStep,
    activeSteps,
    isLoading,
    clearStorage,
  } = useWizard();
  const navigate = useNavigate();

  if (isLoading) return null;

  const handleNext = async () => {
    if (isLastStep) {
      clearStorage();
      navigate('/');
    } else {
      await goToNextStep();
    }
  };

  return (
    <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
      <Button
        type="button"
        variant="secondary"
        onClick={goToPrevStep}
        disabled={isFirstStep}
      >
        Previous
      </Button>
      
      <div className="text-sm font-medium text-gray-500">
          Step {currentStepIndex + 1} of {activeSteps.length}
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={handleNext}
      >
        {isLastStep ? 'Complete' : 'Next'}
      </Button>
    </div>
  );
};
