'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
    >
      Sign out
    </button>
  );
}
