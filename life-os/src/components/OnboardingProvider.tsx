'use client';

import React, { useEffect, useState } from 'react';
import { TeslaOnboardingFlow } from './TeslaUI';
import { useOnboarding } from '../lib/hooks/useOnboarding';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render onboarding on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {shouldShowOnboarding && (
        <TeslaOnboardingFlow
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </>
  );
}
