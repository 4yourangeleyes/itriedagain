import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type OnboardingStep = 'profile' | 'client' | 'templates' | 'document' | 'completed';
export type CanvasGuideStep = 'add-block' | 'styles' | 'save' | null;

interface OnboardingContextType {
  activeStep: OnboardingStep | null;
  setActiveStep: (step: OnboardingStep | null) => void;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  completeStep: (step: OnboardingStep) => void;
  skipOnboarding: () => void;
  isOnboardingActive: boolean;
  userCreatedTemplatesCount: number;
  incrementUserTemplates: () => void;
  templatesPreloaded: boolean;
  setTemplatesPreloaded: (loaded: boolean) => void;
  showTemplatePreloadDialog: boolean;
  setShowTemplatePreloadDialog: (show: boolean) => void;
  celebrationMilestone: OnboardingStep | null;
  setCelebrationMilestone: (milestone: OnboardingStep | null) => void;
  canvasGuideStep: CanvasGuideStep;
  setCanvasGuideStep: (step: CanvasGuideStep) => void;
  nextCanvasGuideStep: () => void;
  isMilestoneCompleted: (milestone: OnboardingStep) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [userCreatedTemplatesCount, setUserCreatedTemplatesCount] = useState(0);
  const [templatesPreloaded, setTemplatesPreloaded] = useState(false);
  const [showTemplatePreloadDialog, setShowTemplatePreloadDialog] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<OnboardingStep | null>(null);
  const [canvasGuideStep, setCanvasGuideStep] = useState<CanvasGuideStep>(null);

  // Load onboarding state from localStorage
  useEffect(() => {
    if (user) {
      const savedSkipped = localStorage.getItem(`onboarding_skipped_${user.id}`);
      const savedTemplateCount = localStorage.getItem(`user_templates_count_${user.id}`);
      const savedPreloaded = localStorage.getItem(`templates_preloaded_${user.id}`);
      
      if (savedSkipped === 'true') {
        setSkipped(true);
      }
      
      if (savedTemplateCount) {
        setUserCreatedTemplatesCount(parseInt(savedTemplateCount, 10));
      }
      
      if (savedPreloaded === 'true') {
        setTemplatesPreloaded(true);
      }
    }
  }, [user]);

  // Reset canvas guide step when document step starts
  useEffect(() => {
    if (activeStep === 'document' && showGuide) {
      setCanvasGuideStep('add-block');
    }
  }, [activeStep, showGuide]);

  const completeStep = (step: OnboardingStep) => {
    // Mark step as complete and show celebration
    if (user) {
      const completedKey = `milestone_completed_${user.id}_${step}`;
      localStorage.setItem(completedKey, 'true');
    }
    setCelebrationMilestone(step);
    setActiveStep(null);
    setShowGuide(false);
    setCanvasGuideStep(null);
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_skipped_${user.id}`, 'true');
      setSkipped(true);
      setActiveStep(null);
      setShowGuide(false);
      setCanvasGuideStep(null);
    }
  };

  const incrementUserTemplates = () => {
    if (user) {
      const newCount = userCreatedTemplatesCount + 1;
      setUserCreatedTemplatesCount(newCount);
      localStorage.setItem(`user_templates_count_${user.id}`, newCount.toString());
    }
  };
  
  const handleSetTemplatesPreloaded = (loaded: boolean) => {
    if (user) {
      setTemplatesPreloaded(loaded);
      localStorage.setItem(`templates_preloaded_${user.id}`, loaded.toString());
    }
  };

  const nextCanvasGuideStep = () => {
    const steps: CanvasGuideStep[] = ['add-block', 'styles', 'save', null];
    const currentIndex = steps.indexOf(canvasGuideStep);
    if (currentIndex < steps.length - 1) {
      setCanvasGuideStep(steps[currentIndex + 1]);
    } else {
      // All steps complete
      completeStep('document');
    }
  };

  // Check if a milestone was already completed
  const isMilestoneCompleted = (milestone: OnboardingStep): boolean => {
    if (!user) return false;
    const completedKey = `milestone_completed_${user.id}_${milestone}`;
    return localStorage.getItem(completedKey) === 'true';
  };

  const isOnboardingActive = !skipped && activeStep !== null;

  return (
    <OnboardingContext.Provider
      value={{
        activeStep,
        setActiveStep,
        showGuide,
        setShowGuide,
        completeStep,
        skipOnboarding,
        isOnboardingActive,
        userCreatedTemplatesCount,
        incrementUserTemplates,
        templatesPreloaded,
        setTemplatesPreloaded: handleSetTemplatesPreloaded,
        showTemplatePreloadDialog,
        setShowTemplatePreloadDialog,
        celebrationMilestone,
        setCelebrationMilestone,
        canvasGuideStep,
        setCanvasGuideStep,
        nextCanvasGuideStep,
        isMilestoneCompleted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
