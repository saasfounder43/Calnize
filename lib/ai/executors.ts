import type { SupabaseClient } from '@supabase/supabase-js';

import { createCalendarEvent } from '@/lib/calendarService';
import type { MeetingDetails } from '@/lib/parseRequest';
import type { AiIntent, ExecuteAiResult } from '@/lib/ai/types';
import { validateParsedCommand, type ValidatedCommand } from '@/lib/ai/validators';
import type { ParsedAiCommand } from '@/lib/ai/types';

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function findBookingTypeByTitle(
  supabase: SupabaseClient,
  userId: string,
  title: string
) {
  const { data, error } = await supabase
    .from('booking_types')
    .select('id, title, slug')
    .eq('user_id', userId)
    .ilike('title', title)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: partial } = await supabase
      .from('booking_types')
      .select('id, title, slug')
      .eq('user_id', userId)
      .ilike('title', `%${title}%`)
      .limit(1)
      .maybeSingle();
    return partial;
  }
  return data;
}

async function applyAvailabilityRules(
  supabase: SupabaseClient,
  userId: string,
  weekdays: number[],
  startTime: string,
  endTime: string,
  replaceExisting: boolean
): Promise<ExecuteAiResult> {
  if (replaceExisting) {
    const { error: delError } = await supabase
      .from('availability_rules')
      .delete()
      .eq('user_id', userId);
    if (delError) throw new Error(delError.message);
  } else {
    const { error: delError } = await supabase
      .from('availability_rules')
      .delete()
      .eq('user_id', userId)
      .in('weekday', weekdays);
    if (delError) throw new Error(delError.message);
  }

  const rows = weekdays.map((weekday) => ({
    user_id: userId,
    weekday,
    start_time: startTime,
    end_time: endTime,
  }));

  const { error } = await supabase.from('availability_rules').insert(rows);
  if (error) throw new Error(error.message);

  return {
    success: true,
    message: `Set availability ${startTime}–${endTime} on ${weekdays.length} day(s).`,
    data: { weekdays, start_time: startTime, end_time: endTime },
  };
}

async function blockRecurringTime(
  supabase: SupabaseClient,
  userId: string,
  weekdays: number[],
  afterTime?: string,
  beforeTime?: string
): Promise<ExecuteAiResult> {
  const { data: rules, error } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('user_id', userId)
    .in('weekday', weekdays);

  if (error) throw new Error(error.message);
  if (!rules?.length) {
    return {
      success: false,
      message: 'No availability rules found for those days. Set working hours first.',
    };
  }

  let updated = 0;
  for (const rule of rules) {
    let start = rule.start_time?.slice(0, 5) ?? '09:00';
    let end = rule.end_time?.slice(0, 5) ?? '17:00';

    if (afterTime && end > afterTime) {
      end = afterTime;
    }
    if (beforeTime && start < beforeTime) {
      start = beforeTime;
    }

    if (start >= end) {
      await supabase.from('availability_rules').delete().eq('id', rule.id);
      updated++;
      continue;
    }

    const { error: upError } = await supabase
      .from('availability_rules')
      .update({ start_time: start, end_time: end })
      .eq('id', rule.id);
    if (upError) throw new Error(upError.message);
    updated++;
  }

  return {
    success: true,
    message: `Blocked time on ${updated} availability rule(s).`,
    data: { weekdays, after_time: afterTime, before_time: beforeTime },
  };
}

async function blockOneOff(
  date: string,
  startTime: string,
  endTime: string
): Promise<ExecuteAiResult> {
  const hasNylas =
    process.env.NYLAS_API_KEY?.trim() &&
    process.env.NYLAS_API_KEY !== 'get_from_nylas.com' &&
    process.env.NYLAS_GRANT_ID?.trim() &&
    process.env.NYLAS_GRANT_ID !== 'your_connected_calendar_id';

  if (!hasNylas) {
    return {
      success: false,
      message:
        'One-off blocks require calendar integration (Nylas). Use recurring blocks like "Block Friday after 6 PM" or connect Nylas.',
    };
  }

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const duration = eh * 60 + em - (sh * 60 + sm);
  if (duration <= 0) {
    return { success: false, message: 'End time must be after start time.' };
  }

  const details: MeetingDetails = {
    attendee_name: null,
    date,
    time: startTime,
    duration_minutes: duration,
    topic: 'Blocked (Calnize AI)',
  };

  const event = await createCalendarEvent(details);
  return {
    success: true,
    message: `Blocked ${date} ${startTime}–${endTime} on your calendar.`,
    data: { event },
  };
}

async function createBookingType(
  supabase: SupabaseClient,
  userId: string,
  payload: Record<string, unknown>,
  paid: boolean
): Promise<ExecuteAiResult> {
  const title = payload.title as string;
  const slug = slugFromTitle(title);

  const { count } = await supabase
    .from('booking_types')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data: profile } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', userId)
    .single();

  if (profile?.plan_type === 'free' && (count ?? 0) >= 1) {
    return {
      success: false,
      message: 'Free plan allows one booking type. Upgrade to Pro for more.',
    };
  }
  if (paid && profile?.plan_type === 'free') {
    return {
      success: false,
      message: 'Paid booking types require the Pro plan.',
    };
  }

  const availability = payload.availability as
    | { days?: string[]; start_after?: string }
    | undefined;

  const { data, error } = await supabase
    .from('booking_types')
    .insert({
      user_id: userId,
      slug,
      title,
      description: (payload.description as string) || null,
      duration_minutes: payload.duration_minutes as number,
      price: paid ? (payload.price as number) : null,
      currency: (payload.currency as string) || 'USD',
      buffer_minutes: (payload.buffer_minutes as number) ?? 0,
      minimum_notice_minutes: 60,
      is_active: true,
    })
    .select('id, slug, title')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'A booking type with a similar name already exists.' };
    }
    throw new Error(error.message);
  }

  if (availability?.days?.length && availability.start_after) {
    const dayMap: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 0,
    };
    const weekdays = availability.days
      .map((d) => dayMap[d])
      .filter((n) => n !== undefined);
    if (weekdays.length) {
      await applyAvailabilityRules(
        supabase,
        userId,
        weekdays,
        availability.start_after,
        '23:59',
        false
      );
    }
  }

  return {
    success: true,
    message: `Created booking type "${data.title}".`,
    data: { booking_type: data },
  };
}

export async function executeSchedulingCommand(
  supabase: SupabaseClient,
  userId: string,
  parsed: ParsedAiCommand
): Promise<ExecuteAiResult> {
  const validation = validateParsedCommand(parsed);
  if (!validation.ok) {
    return { success: false, message: validation.error };
  }

  const { intent, payload } = validation.validated;
  return runIntent(supabase, userId, intent, payload);
}

async function runIntent(
  supabase: SupabaseClient,
  userId: string,
  intent: AiIntent,
  payload: Record<string, unknown>
): Promise<ExecuteAiResult> {
  switch (intent) {
    case 'set_availability':
    case 'update_working_hours':
      return applyAvailabilityRules(
        supabase,
        userId,
        payload.weekdays as number[],
        payload.start_time as string,
        payload.end_time as string,
        payload.replace_existing as boolean
      );

    case 'block_time': {
      const weekdays = payload.weekdays as number[] | undefined;
      if (payload.date) {
        return blockOneOff(
          payload.date as string,
          payload.start_time as string,
          payload.end_time as string
        );
      }
      if (!weekdays?.length) {
        return { success: false, message: 'No weekdays specified for block.' };
      }
      return blockRecurringTime(
        supabase,
        userId,
        weekdays,
        payload.after_time as string | undefined,
        payload.before_time as string | undefined
      );
    }

    case 'create_meeting_type':
      return createBookingType(supabase, userId, payload, false);

    case 'create_paid_meeting':
      return createBookingType(supabase, userId, payload, true);

    case 'edit_meeting_type': {
      const matchTitle = payload.booking_type_title as string;
      const existing = await findBookingTypeByTitle(supabase, userId, matchTitle);
      if (!existing) {
        return { success: false, message: `No booking type found matching "${matchTitle}".` };
      }

      const updates: Record<string, unknown> = {};
      if (payload.title) updates.title = payload.title;
      if (payload.duration_minutes) updates.duration_minutes = payload.duration_minutes;
      if (payload.price !== undefined) updates.price = payload.price;
      if (payload.buffer_minutes !== undefined) updates.buffer_minutes = payload.buffer_minutes;
      if (payload.is_active !== undefined) updates.is_active = payload.is_active;

      if (!Object.keys(updates).length) {
        return { success: false, message: 'Nothing to update. Specify what should change.' };
      }

      const { error } = await supabase
        .from('booking_types')
        .update(updates)
        .eq('id', existing.id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return {
        success: true,
        message: `Updated "${existing.title}".`,
        data: { booking_type_id: existing.id, updates },
      };
    }

    case 'set_buffer': {
      const buffer = payload.buffer_minutes as number;
      if (payload.apply_to_all) {
        const { error } = await supabase
          .from('booking_types')
          .update({ buffer_minutes: buffer })
          .eq('user_id', userId);
        if (error) throw new Error(error.message);
        return {
          success: true,
          message: `Set ${buffer} minute buffer on all booking types.`,
        };
      }

      const title = payload.booking_type_title as string | undefined;
      if (!title) {
        return {
          success: false,
          message: 'Specify a booking type title or say "all meeting types".',
        };
      }
      const existing = await findBookingTypeByTitle(supabase, userId, title);
      if (!existing) {
        return { success: false, message: `No booking type found matching "${title}".` };
      }
      const { error } = await supabase
        .from('booking_types')
        .update({ buffer_minutes: buffer })
        .eq('id', existing.id);
      if (error) throw new Error(error.message);
      return {
        success: true,
        message: `Set ${buffer} minute buffer on "${existing.title}".`,
      };
    }

    default:
      return { success: false, message: 'Unsupported action.' };
  }
}

export function buildParsedFromValidated(
  validated: ValidatedCommand,
  summary: string
): ParsedAiCommand {
  return {
    status: 'success',
    intent: validated.intent,
    payload: validated.payload,
    clarification_needed: '',
    summary,
    requires_confirmation: false,
  };
}
