import { SupabaseClient } from '@supabase/supabase-js';

const BOOKING_NAMES: Record<string, { free: string; paid: string }> = {
  consultation: { free: 'Consultation', paid: 'Strategy Call' },
  discovery: { free: 'Discovery Call', paid: 'Design Consultation' },
  appointment: { free: 'Appointment', paid: 'Appointment' },
  demo: { free: 'Product Demo', paid: 'Sales Call' },
};

interface CreateBookingTypeParams {
  userId: string;
  userType: string;
  planType: string;
  price: number;
  currency: string;
  meetingMode: string;
  meetingLink: string | null;
  location: string | null;
  /** NEW, optional: where the booker's payment should be sent (e.g. a Stripe Payment Link). */
  paymentLink?: string | null;
  supabase: SupabaseClient;
}

export async function createBookingType({
  userId,
  userType,
  planType,
  price,
  currency,
  meetingMode,
  meetingLink,
  location,
  paymentLink = null,
  supabase,
}: CreateBookingTypeParams): Promise<string> {
  const isPaid = planType !== 'free';
  const names = BOOKING_NAMES[userType] ?? BOOKING_NAMES['demo'];
  const title = isPaid ? names.paid : names.free;
  const duration = isPaid ? 60 : 30;

  const slug = title.toLowerCase().replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from('booking_types')
    .insert({
      user_id: userId,
      slug: slug,
      title,
      duration_minutes: duration,
      price,
      currency,
      participation_mode: meetingMode,
      meeting_link: meetingLink ?? null,
      payment_link: paymentLink ?? null,
      is_active: true,
    })
    .select('id, title, slug')
    .single();

  if (error) throw new Error(`Failed to create booking type: ${error.message}`);

  // NOTE: preserved exactly as the original function — it returns the slug,
  // not data.id, and never persists `location` even though it's accepted as
  // a parameter. Both look like pre-existing gaps, but changing them here
  // would alter behavior for the current live form-based onboarding, which
  // calls this same function. Left untouched intentionally — flagged
  // separately rather than silently changed.
  return title.toLowerCase().replace(/\s+/g, '-');
}