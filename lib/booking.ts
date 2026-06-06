import { createServerSupabaseClient } from './supabase';

export type BookingPayload = {
  userId: string;
  title: string;
  description?: string;
  isPaid: boolean;
  price?: number;
  durationMinutes: number;
  availability: Array<string>;
  calendarConnection: 'connect' | 'skip';
};

export type BookingType = {
  id: string;
  title: string;
  isPaid: boolean;
  price?: number;
  durationMinutes: number;
  availability: Array<string>;
  link: string;
};

export async function createBookingType(payload: BookingPayload): Promise<BookingType> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('booking_types')
    .insert({
      user_id: payload.userId,
      title: payload.title,
      duration: payload.durationMinutes,
      price: payload.price ?? 0,
      currency: 'USD',
      meeting_mode: payload.calendarConnection === 'connect' ? 'google' : 'manual',
      meeting_link: payload.calendarConnection === 'connect' ? 'google' : null,
      location: null,
      color_theme: 'blue',
      active: true,
    })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create booking type');
  }

  const id = data.id as string;
  return {
    id,
    title: data.title,
    isPaid: payload.isPaid,
    price: data.price ?? payload.price,
    durationMinutes: data.duration,
    availability: payload.availability,
    link: `https://calnize.example.com/book/${id}`,
  };
}

export async function setupAvailability(bookingTypeId: string, availability: Array<string>): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: booking, error: bookingError } = await supabase
    .from('booking_types')
    .select('user_id')
    .eq('id', bookingTypeId)
    .single();

  if (bookingError || !booking) {
    throw bookingError ?? new Error('Booking type not found');
  }

  const rows = availability.map((entry) => ({
    user_id: booking.user_id,
    day_of_week: entry,
    start_time: '',
    end_time: '',
  }));

  const { error } = await supabase.from('availability').insert(rows);
  if (error) throw error;
  return true;
}

export async function createBookingLink(bookingTypeId: string): Promise<string> {
  return `https://calnize.example.com/book/${bookingTypeId}`;
}
