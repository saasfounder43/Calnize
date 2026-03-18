import { SupabaseClient } from '@supabase/supabase-js';

export interface DayAvailability {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export const DEFAULT_AVAILABILITY: DayAvailability[] = [
  { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
  { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
];

export async function setupAvailability(
  userId: string,
  availability: DayAvailability[],
  supabase: SupabaseClient
): Promise<void> {
  const rows = availability
    .filter((d) => d.enabled)
    .map((d) => ({
      user_id: userId,
      day_of_week: d.day,
      start_time: d.startTime,
      end_time: d.endTime,
    }));

  const { error } = await supabase.from('availability').insert(rows);
  if (error) throw new Error(`Failed to save availability: ${error.message}`);
}
