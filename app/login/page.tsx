'use client';

import { supabase } from '@/lib/auth/supabaseClient';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">Sign in to Calnize</h1>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
