'use client';

interface StepConnectCalendarProps {
  onSkip: () => void;
  onBack: () => void;
}

export default function StepConnectCalendar({ onSkip, onBack }: StepConnectCalendarProps) {
  const handleConnect = () => {
    sessionStorage.setItem('onboarding_calendar_connect', 'true');
    window.location.href = '/api/google/connect?return=/onboarding?step=calendar_done';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Connect your calendar</h2>
        <p className="mt-1 text-sm text-gray-500">Sync your availability so clients can book the right slots.</p>
      </div>

      <div className="flex gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
        <span className="text-amber-500 text-lg leading-none mt-0.5">⚠️</span>
        <p className="text-sm text-amber-700">
          Your clients won't see any available booking slots until you connect your Google Calendar.
        </p>
      </div>

      <button onClick={handleConnect} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition">
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Connect Google Calendar
      </button>

      <div className="flex flex-col items-center gap-2">
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 transition underline underline-offset-2">
          Skip for now
        </button>
        <p className="text-xs text-gray-400 text-center">You can always connect it later from your dashboard.</p>
      </div>

      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition text-left">
        ← Back
      </button>
    </div>
  );
}
