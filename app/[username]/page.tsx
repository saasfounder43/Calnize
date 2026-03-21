import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import ViralFooter from '@/components/growth/viral-footer';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: { username: string };
}

async function getHostData(username: string) {
  const { data: user } = await supabaseServer
    .from('users')
    .select('id, full_name, email, slug')
    .eq('slug', username)
    .maybeSingle();

  if (!user) return null;

  const { data: bookingTypes } = await supabaseServer
    .from('booking_types')
    .select('id, title, duration, price, currency, slug')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: true });

  const { data: branding } = await supabaseServer
    .from('branding_settings')
    .select('logo_url, white_label')
    .eq('user_id', user.id)
    .maybeSingle();

  return { user, bookingTypes: bookingTypes ?? [], branding };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getHostData(params.username);
  if (!data) return { title: 'Not Found' };

  const name = data.user.full_name || data.user.email || 'Host';
  const logoUrl = data.branding?.logo_url ?? null;

  return {
    title: `Book a meeting with ${name}`,
    description: `Schedule time with ${name} on Calnize.`,
    openGraph: {
      title: `Book a meeting with ${name}`,
      description: `Schedule time with ${name} on Calnize.`,
      images: logoUrl ? [{ url: logoUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Book a meeting with ${name}`,
      description: `Schedule time with ${name} on Calnize.`,
      images: logoUrl ? [logoUrl] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const data = await getHostData(params.username);
  if (!data) notFound();

  const { user, bookingTypes, branding } = data;
  const hostName = user.full_name || user.email || 'Host';
  const initials = hostName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const whiteLabel = branding?.white_label ?? false;
  const logoUrl = branding?.logo_url ?? null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      padding: '60px 24px 40px',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Host Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          {/* Logo or initials */}
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '20px',
            margin: '0 auto 20px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={hostName}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                {initials}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
            {hostName}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Choose a meeting type to get started
          </p>
        </div>

        {/* Booking Types */}
        {bookingTypes.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              No booking types available at the moment.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookingTypes.map((type: any) => (
              <Link
                key={type.id}
                href={`/${user.slug}/${type.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="glass-card"
                  style={{
                    padding: '24px 28px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                      {type.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <span>⏱ {type.duration} min</span>
                      <span>
                        {type.price && type.price > 0
                          ? `💰 ${type.price} ${type.currency}`
                          : '✓ Free'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '20px', color: 'var(--color-text-muted)' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <ViralFooter whiteLabel={whiteLabel} />
      </div>
    </div>
  );
}
