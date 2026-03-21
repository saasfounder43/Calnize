import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import PublicBookingPage from './booking-client';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: { username: string; slug: string };
}

async function getPageData(username: string, slug: string) {
  const { data: user } = await supabaseServer
    .from('users')
    .select('id, full_name, email')
    .eq('slug', username)
    .maybeSingle();

  if (!user) return null;

  const { data: bookingType } = await supabaseServer
    .from('booking_types')
    .select('title, duration, price, currency')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  const { data: branding } = await supabaseServer
    .from('branding_settings')
    .select('logo_url')
    .eq('user_id', user.id)
    .maybeSingle();

  return { user, bookingType, branding };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPageData(params.username, params.slug);
  if (!data || !data.bookingType) return { title: 'Book a Meeting' };

  const name = data.user.full_name || data.user.email || 'Host';
  const { title, duration, price, currency } = data.bookingType;
  const logoUrl = data.branding?.logo_url ?? null;
  const priceStr = price && price > 0 ? ` · ${price} ${currency}` : ' · Free';

  return {
    title: `Book ${title} with ${name}`,
    description: `Schedule a ${duration}-minute ${title.toLowerCase()} with ${name} on Calnize.${priceStr}`,
    openGraph: {
      title: `Book ${title} with ${name}`,
      description: `Schedule a ${duration}-minute ${title.toLowerCase()} with ${name}.`,
      images: logoUrl ? [{ url: logoUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Book ${title} with ${name}`,
      description: `Schedule a ${duration}-minute ${title.toLowerCase()} with ${name}.`,
      images: logoUrl ? [logoUrl] : [],
    },
  };
}

export default function BookingPageWrapper() {
  return <PublicBookingPage />;
}
