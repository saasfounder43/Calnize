import type { AiIntent, ParsedAiCommand } from '@/lib/ai/types';

const DAY_NAMES: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

export function normalizeWeekdays(raw: unknown): number[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: number[] = [];
  for (const item of raw) {
    if (typeof item === 'number' && item >= 0 && item <= 6) {
      out.push(item);
      continue;
    }
    if (typeof item === 'string') {
      const key = item.trim().toLowerCase().slice(0, 3);
      const full = item.trim().toLowerCase();
      const n = DAY_NAMES[full] ?? DAY_NAMES[key];
      if (n !== undefined) out.push(n);
    }
  }
  return out.length ? [...new Set(out)].sort((a, b) => a - b) : null;
}

function isHHmm(value: unknown): value is string {
  return typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value.trim());
}

function normalizeHHmm(value: string): string {
  const [h, m] = value.trim().split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export interface ValidatedCommand {
  intent: AiIntent;
  payload: Record<string, unknown>;
}

export function validateParsedCommand(parsed: ParsedAiCommand): {
  ok: true;
  validated: ValidatedCommand;
} | {
  ok: false;
  error: string;
} {
  if (parsed.status !== 'success' || !parsed.intent) {
    return {
      ok: false,
      error: parsed.clarification_needed || 'Command could not be understood.',
    };
  }

  const intent = parsed.intent;
  const p = { ...parsed.payload };

  switch (intent) {
    case 'set_availability':
    case 'update_working_hours': {
      const weekdays = normalizeWeekdays(p.weekdays);
      if (!weekdays) return { ok: false, error: 'Which days should this apply to? (e.g. Mon–Fri)' };
      if (!isHHmm(p.start_time) || !isHHmm(p.end_time)) {
        return { ok: false, error: 'Please specify start and end times (e.g. 10:00 to 18:00).' };
      }
      return {
        ok: true,
        validated: {
          intent,
          payload: {
            weekdays,
            start_time: normalizeHHmm(p.start_time),
            end_time: normalizeHHmm(p.end_time),
            replace_existing: p.replace_existing !== false,
          },
        },
      };
    }

    case 'block_time': {
      const weekdays = normalizeWeekdays(p.weekdays);
      const hasDate = typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date);
      if (!weekdays && !hasDate) {
        return { ok: false, error: 'Specify which day to block (e.g. Fridays or a date).' };
      }
      if (weekdays && (!isHHmm(p.after_time) && !isHHmm(p.before_time) && !isHHmm(p.start_time))) {
        return {
          ok: false,
          error: 'Specify the time window to block (e.g. after 18:00).',
        };
      }
      if (hasDate && (!isHHmm(p.start_time) || !isHHmm(p.end_time))) {
        return { ok: false, error: 'For a specific date, provide start_time and end_time.' };
      }
      return {
        ok: true,
        validated: {
          intent,
          payload: {
            weekdays: weekdays ?? undefined,
            date: hasDate ? p.date : undefined,
            after_time: isHHmm(p.after_time) ? normalizeHHmm(p.after_time) : undefined,
            before_time: isHHmm(p.before_time) ? normalizeHHmm(p.before_time) : undefined,
            start_time: isHHmm(p.start_time) ? normalizeHHmm(p.start_time) : undefined,
            end_time: isHHmm(p.end_time) ? normalizeHHmm(p.end_time) : undefined,
          },
        },
      };
    }

    case 'create_meeting_type':
    case 'create_paid_meeting': {
      const title = typeof p.title === 'string' ? p.title.trim() : '';
      if (!title) return { ok: false, error: 'What should this meeting type be called?' };
      const duration =
        typeof p.duration_minutes === 'number' && p.duration_minutes > 0
          ? Math.round(p.duration_minutes)
          : 30;
      const price =
        intent === 'create_paid_meeting'
          ? typeof p.price === 'number'
            ? p.price
            : typeof p.price === 'string'
              ? parseFloat(p.price)
              : NaN
          : null;
      if (intent === 'create_paid_meeting' && (!Number.isFinite(price) || price! <= 0)) {
        return { ok: false, error: 'What price should this paid meeting have?' };
      }
      const currency =
        typeof p.currency === 'string' && p.currency.trim()
          ? p.currency.trim().toUpperCase()
          : 'USD';
      return {
        ok: true,
        validated: {
          intent,
          payload: {
            title,
            description: typeof p.description === 'string' ? p.description : null,
            duration_minutes: duration,
            price: intent === 'create_paid_meeting' ? price : null,
            currency,
            buffer_minutes:
              typeof p.buffer_minutes === 'number' ? Math.max(0, Math.round(p.buffer_minutes)) : 0,
            availability: p.availability ?? undefined,
          },
        },
      };
    }

    case 'edit_meeting_type': {
      const title = typeof p.booking_type_title === 'string' ? p.booking_type_title.trim() : '';
      if (!title) {
        return { ok: false, error: 'Which booking type should I update? Provide its title.' };
      }
      return {
        ok: true,
        validated: {
          intent,
          payload: {
            booking_type_title: title,
            title: typeof p.title === 'string' ? p.title : undefined,
            duration_minutes: typeof p.duration_minutes === 'number' ? p.duration_minutes : undefined,
            price: p.price !== undefined ? p.price : undefined,
            buffer_minutes: typeof p.buffer_minutes === 'number' ? p.buffer_minutes : undefined,
            is_active: typeof p.is_active === 'boolean' ? p.is_active : undefined,
          },
        },
      };
    }

    case 'set_buffer': {
      const buffer =
        typeof p.buffer_minutes === 'number'
          ? Math.max(0, Math.round(p.buffer_minutes))
          : NaN;
      if (!Number.isFinite(buffer)) {
        return { ok: false, error: 'How many minutes of buffer should I set?' };
      }
      return {
        ok: true,
        validated: {
          intent,
          payload: {
            buffer_minutes: buffer,
            booking_type_title:
              typeof p.booking_type_title === 'string' ? p.booking_type_title : undefined,
            apply_to_all: p.apply_to_all === true,
          },
        },
      };
    }

    default:
      return { ok: false, error: 'Unsupported intent.' };
  }
}
