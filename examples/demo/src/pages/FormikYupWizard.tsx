import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { WizardProvider, useWizard, type IWizardConfig, YupAdapter, LocalStorageAdapter } from 'wizzard-stepper-react';
import { useEffect } from 'react';
import { StepperControls } from '../components/StepperControls';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardFooter } from '../components/ui/Card';

// --- Schemas ---
const step1Schema = Yup.object({
  jobTitle: Yup.string().required('Job title is required'),
  company: Yup.string().required('Company is required'),
});

const step2Schema = Yup.object({
  skills: Yup.string().min(10, 'Describe skills with at least 10 chars').required('Skills required'),
});

// --- Components ---
const Step1 = () => {
    const { handleStepChange, wizardData, allErrors } = useWizard();
    
    const formik = useFormik({
        initialValues: {
            jobTitle: wizardData.jobTitle || '',
            company: wizardData.company || '',
        },
        validationSchema: step1Schema,
        onSubmit: () => {},
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleChange(e);
        handleStepChange(e.target.name, e.target.value);
    };

    return (
        <div className="space-y-6">
             <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                <p className="text-gray-500 text-sm">Tell us about your current role.</p>
             </div>
             
             <div className="space-y-4">
                <Input
                    name="jobTitle"
                    label="Job Title"
                    placeholder="Senior Engineer"
                    value={formik.values.jobTitle}
                    error={allErrors.experience?.['jobTitle']}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                />
                <Input
                    name="company"
                    label="Company"
                    placeholder="Tech Corp"
                    value={formik.values.company}
                    error={allErrors.experience?.['company']}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                />
             </div>
        </div>
    )
}

const Step2 = () => {
    const { handleStepChange, wizardData, allErrors } = useWizard();
    const formik = useFormik({
        initialValues: {
            skills: wizardData.skills || '',
        },
        validationSchema: step2Schema,
        onSubmit: () => {},
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        formik.handleChange(e);
        handleStepChange(e.target.name, e.target.value);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                <p className="text-gray-500 text-sm">Highlight your top professional skills.</p>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Key Skills</label>
                <textarea
                    name="skills"
                    className="w-full flex min-h-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                    placeholder="React, TypeScript, Node.js..."
                    value={formik.values.skills}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                />
                 {allErrors.skills?.['skills'] && (
                    <p className="text-sm font-medium text-red-500">{allErrors.skills['skills']}</p>
                )}
            </div>
        </div>
    )
}

// --- Config ---
const wizardConfig: IWizardConfig = {
    persistence: {
        mode: 'onChange',
        adapter: new LocalStorageAdapter('formik_wizard_'),
    },
    steps: [
        {
            id: 'experience',
            label: 'Experience',
            validationAdapter: new YupAdapter(step1Schema)
        },
        {
            id: 'skills',
            label: 'Skills',
            validationAdapter: new YupAdapter(step2Schema)
        },
        { id: 'review', label: 'Done' }
    ]
};

const WizardContent = () => {
    const { currentStep, wizardData, clearStorage } = useWizard();

    useEffect(() => {
      return () => {
        clearStorage();
      };
    }, [clearStorage]);
    
    if (!currentStep) return null;

    return (
        <div className="max-w-xl mx-auto py-8">
            <Card className="shadow-xl shadow-indigo-50/50">
                <CardContent className="pt-8">
                    {currentStep.id === 'experience' && <Step1 />}
                    {currentStep.id === 'skills' && <Step2 />}
                    {currentStep.id === 'review' && (
                        <div className="space-y-6">
                            <div className="space-y-2 text-center py-4">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                    ★
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Profile Updated</h2>
                                <p className="text-gray-500">Your professional experience is saved.</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <pre className="text-xs text-gray-700 leading-relaxed overflow-auto">
                                    {JSON.stringify(wizardData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pb-8 block">
                    <StepperControls />
                </CardFooter>
            </Card>
        </div>
    )
}

export default function FormikYupWizard() {
    return (
        <WizardProvider config={wizardConfig}>
            <WizardContent />
        </WizardProvider>
    )
}
