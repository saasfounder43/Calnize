'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function BookingPoweredByBadge() {
  const params = useParams();
  const username = params?.username as string;
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!username) { setLoaded(true); return; }

    const fetchBranding = async () => {
      try {
        // Get host user id from slug
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('slug', username)
          .maybeSingle();

        if (!user) { setLoaded(true); return; }

        const { data: branding } = await supabase
          .from('branding_settings')
          .select('white_label')
          .eq('user_id', user.id)
          .maybeSingle();

        setWhiteLabel(branding?.white_label ?? false);
      } catch {
        setWhiteLabel(false);
      } finally {
        setLoaded(true);
      }
    };

    fetchBranding();
  }, [username]);

  if (!loaded || whiteLabel) return null;

  return (
    <Link
      href="https://calnize.com"
      target="_blank"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '8px 16px',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#4b5563',
        textDecoration: 'none',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        zIndex: 50,
      }}
      className="powered-by-badge hover:bg-white hover:text-black hover:shadow-lg hover:-translate-y-1"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
          borderRadius: '6px',
          padding: '4px',
          display: 'flex',
        }}>
          <Calendar size={12} color="white" />
        </div>
        <span>Scheduling powered by Calnize</span>
      </div>
    </Link>
  );
}
