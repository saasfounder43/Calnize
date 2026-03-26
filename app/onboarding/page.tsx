'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth/supabaseClient';
import { createBookingType } from '@/lib/onboarding/createBookingType';
import { setupAvailability, DayAvailability } from '@/lib/onboarding/setupAvailability';
import ProgressBar from '@/components/onboarding/progress-bar';
import StepUserType from '@/components/onboarding/step-user-type';
import StepChargeMeetings from '@/components/onboarding/step-charge-meetings';
import StepMeetingType from '@/components/onboarding/step-meeting-type';
import StepWorkingHours from '@/components/onboarding/step-working-hours';
import StepTheme from '@/components/onboarding/step-theme';
import StepConnectCalendar from '@/components/onboarding/step-connect-calendar';
import SuccessScreen from '@/components/onboarding/success-screen';

const USER_TYPE_MAP: Record<string, string> = {
  Consultant: 'consultation',
  Coach: 'consultation',
  Freelancer: 'discovery',
  Designer: 'discovery',
  Doctor: 'appointment',
  'Sales Team': 'demo',
  Other: 'demo',
};

const TOTAL_STEPS = 6;

interface OnboardingState {
  userType: string;
  charge: boolean;
  price: number;
  currency: string;
  meetingMode: string;
  meetingLink: string | null;
  location: string | null;
  theme: string;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState<string>('free');
  const [userSlug, setUserSlug] = useState<string>('');
  const [bookingSlug, setBookingSlug] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [state, setState] = useState<Partial<OnboardingState>>({});

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('users')
        .select('slug, plan_type')
        .eq('id', user.id)
        .single();

      if (data) {
        setPlanType(data.plan_type ?? 'free');
        setUserSlug(data.slug ?? '');
      }

      const stepParam = searchParams.get('step');
      const parsedStep = stepParam ? Number(stepParam) : NaN;
      if (!Number.isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 6) {
        setStep(parsedStep);
      }
    };
    fetchUser();
  }, []);

  const handleUserType = (label: string) => {
    setState((prev) => ({ ...prev, userType: USER_TYPE_MAP[label] ?? 'demo' }));
    setStep(2);
  };

  const handleChargeMeetings = (value: { charge: boolean; price: number; currency: string }) => {
    setState((prev) => ({ ...prev, ...value }));
    setStep(3);
  };

  const handleMeetingType = (value: { meetingMode: string; meetingLink: string | null; location: string | null }) => {
    setState((prev) => ({ ...prev, ...value }));
    setStep(4);
  };

  const handleWorkingHours = async (availability: DayAvailability[]) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await supabase.from('availability').delete().eq('user_id', user.id);
      await supabase.from('booking_types').delete().eq('user_id', user.id);

      await setupAvailability(user.id, availability, supabase);

      const meetingTypeSlug = await createBookingType({
        userId: user.id,
        userType: state.userType!,
        planType,
        price: state.price ?? 0,
        currency: state.currency ?? 'USD',
        meetingMode: state.meetingMode!,
        meetingLink: state.meetingLink ?? null,
        location: state.location ?? null,
        supabase,
      });

      await supabase
        .from('users')
        .update({ user_type: state.userType, timezone, onboarding_completed: true })
        .eq('id', user.id);

      setBookingSlug(userSlug);
      setBookingType(meetingTypeSlug);
      setStep(5);
    } catch (err) {
      console.error('[onboarding] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTheme = async (theme: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('booking_types').update({ color_theme: theme }).eq('user_id', user.id);
    }
    setState((prev) => ({ ...prev, theme }));
    setStep(6);
  };

  const handlePlanRefresh = (newPlan: string) => {
    setPlanType(newPlan);
  };

  const handleThemeSkip = () => setStep(6);
  const handleCalendarSkip = () => setStep(7);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {step <= TOTAL_STEPS && (
          <div className="mb-8">
            <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
          </div>
        )}

        {step === 1 && <StepUserType onNext={handleUserType} />}
        {step === 2 && <StepChargeMeetings planType={planType} onNext={handleChargeMeetings} onBack={() => setStep(1)} />}
        {step === 3 && <StepMeetingType onNext={handleMeetingType} onBack={() => setStep(2)} />}
        {step === 4 && <StepWorkingHours onNext={handleWorkingHours} onBack={() => setStep(3)} />}
        {step === 5 && (
          <StepTheme
            planType={planType}
            onNext={handleTheme}
            onSkip={handleThemeSkip}
            onBack={() => setStep(4)}
            onPlanRefresh={handlePlanRefresh}
          />
        )}
        {step === 6 && <StepConnectCalendar onSkip={handleCalendarSkip} onBack={() => setStep(5)} />}
        {step === 7 && <SuccessScreen slug={bookingSlug} meetingType={bookingType} />}

        {loading && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Setting up your account...</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
