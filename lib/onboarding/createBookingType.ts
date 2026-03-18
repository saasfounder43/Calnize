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
  supabase,
}: CreateBookingTypeParams): Promise<string> {
  const isPaid = planType !== 'free';
  const names = BOOKING_NAMES[userType] ?? BOOKING_NAMES['demo'];
  const title = isPaid ? names.paid : names.free;
  const duration = isPaid ? 60 : 30;

  const { data, error } = await supabase
    .from('booking_types')
    .insert({
      user_id: userId,
      title,
      duration,
      price,
      currency,
      meeting_mode: meetingMode,
      meeting_link: meetingLink ?? null,
      location: location ?? null,
      color_theme: 'blue',
      active: true,
    })
    .select('id, title')
    .single();

  if (error) throw new Error(`Failed to create booking type: ${error.message}`);

  return title.toLowerCase().replace(/\s+/g, '-');
}
