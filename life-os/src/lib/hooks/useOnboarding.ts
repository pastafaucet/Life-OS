'use client';

import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstTime: boolean;
  hasCompletedOnboarding: boolean;
  currentStep: number;
  skippedOnboarding: boolean;
}

const ONBOARDING_STORAGE_KEY = 'life-os-onboarding-state';

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isFirstTime: true,
    hasCompletedOnboarding: false,
    currentStep: 0,
    skippedOnboarding: false
  });

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        try {
          const parsedState = JSON.parse(stored);
          setOnboardingState(parsedState);
        } catch (error) {
          console.error('Failed to parse onboarding state:', error);
        }
      }
    }
  }, []);

  // Save onboarding state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingState));
    }
  }, [onboardingState]);

  const completeOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      isFirstTime: false
    }));
  };

  const skipOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      skippedOnboarding: true,
      isFirstTime: false
    }));
  };

  const resetOnboarding = () => {
    setOnboardingState({
      isFirstTime: true,
      hasCompletedOnboarding: false,
      currentStep: 0,
      skippedOnboarding: false
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  };

  const shouldShowOnboarding = () => {
    return onboardingState.isFirstTime && !onboardingState.hasCompletedOnboarding && !onboardingState.skippedOnboarding;
  };

  return {
    onboardingState,
    shouldShowOnboarding: shouldShowOnboarding(),
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}
