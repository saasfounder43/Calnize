'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth/supabaseClient';

const THEMES = [
  { label: 'Blue', value: 'blue', color: '#3B82F6' },
  { label: 'Green', value: 'green', color: '#10B981' },
  { label: 'Purple', value: 'purple', color: '#8B5CF6' },
  { label: 'Black', value: 'black', color: '#111827' },
  { label: 'Orange', value: 'orange', color: '#F97316' },
];

interface StepThemeProps {
  planType: string;
  onNext: (theme: string) => void;
  onSkip: () => void;
  onBack: () => void;
  onPlanRefresh: (newPlan: string) => void;
}

export default function StepTheme({ planType, onNext, onSkip, onBack, onPlanRefresh }: StepThemeProps) {
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(false);

  const isPro = planType === 'pro' || planType === 'paid';

  // Handle return from LemonSqueezy upgrade
  useEffect(() => {
    const upgraded = searchParams.get('upgraded');
    if (upgraded === 'true') {
      setChecking(true);
      const refreshPlan = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data } = await supabase
            .from('users')
            .select('plan_type')
            .eq('id', user.id)
            .single();
          if (data?.plan_type) {
            onPlanRefresh(data.plan_type);
          }
        } catch (err) {
          console.error('Plan refresh failed:', err);
        } finally {
          setChecking(false);
        }
      };
      refreshPlan();
    }
  }, []);

  const handleUpgrade = () => {
    const url = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL;
    if (!url) { alert('Upgrade link not configured yet.'); return; }
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?step=5&upgraded=true`;
    window.location.href = `${url}?redirect=${encodeURIComponent(returnUrl)}`;
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Checking your plan...</p>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Customize your theme
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Make your booking page match your brand.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 py-6 px-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <span className="text-3xl">🎨</span>
          <div>
            <p className="text-sm font-medium text-gray-700">Theme customization is a Pro feature</p>
            <p className="text-xs text-gray-400 mt-1">Upgrade to personalise your booking page colors.</p>
          </div>
          {/* Upgrade button — inline, no modal */}
          <button
            onClick={handleUpgrade}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Upgrade to Pro — $9/month ⚡
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
          >
            Skip →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Customize your theme
        </h2>
        <p className="mt-1 text-sm text-gray-500">Pick a color for your booking page.</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            onClick={() => onNext(theme.value)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-gray-900 transition group"
          >
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.color }} />
            <span className="text-xs text-gray-500 group-hover:text-gray-900">{theme.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
