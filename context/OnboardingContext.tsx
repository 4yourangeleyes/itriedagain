import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type OnboardingStep = 'profile' | 'client' | 'templates' | 'document' | 'completed';

interface OnboardingContextType {
  activeStep: OnboardingStep | null;
  setActiveStep: (step: OnboardingStep | null) => void;
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  completeStep: (step: OnboardingStep) => void;
  skipOnboarding: () => void;
  isOnboardingActive: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // Load onboarding state from localStorage
  useEffect(() => {
    if (user) {
      const savedSkipped = localStorage.getItem(`onboarding_skipped_${user.id}`);
      if (savedSkipped === 'true') {
        setSkipped(true);
      }
    }
  }, [user]);

  const completeStep = (step: OnboardingStep) => {
    // Mark step as complete and move to next
    setActiveStep(null);
    setShowGuide(false);
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_skipped_${user.id}`, 'true');
      setSkipped(true);
      setActiveStep(null);
      setShowGuide(false);
    }
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
