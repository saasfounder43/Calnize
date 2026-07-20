import { Suspense } from 'react';
import AgenticOnboardingPanel from '@/components/onboarding/AgenticOnboardingPanel';

export default function OnboardingAiPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}
    >
      <Suspense fallback={null}>
        <AgenticOnboardingPanel />
      </Suspense>
    </div>
  );
}