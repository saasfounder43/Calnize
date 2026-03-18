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
      is_active: true,
    })
    .select('id, title, slug')
    .single();

  if (error) throw new Error(`Failed to create booking type: ${error.message}`);

  return title.toLowerCase().replace(/\s+/g, '-');
}
