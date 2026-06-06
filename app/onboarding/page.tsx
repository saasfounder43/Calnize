'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AIAssistantPanel = dynamic(() => import('@/components/AIAssistantPanel'), { ssr: false });

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <AIAssistantPanel />
    </Suspense>
  );
}
