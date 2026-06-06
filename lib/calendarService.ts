import { addMinutes } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import Nylas from 'nylas';
import { FreeBusyType } from 'nylas';

import type { MeetingDetails } from '@/lib/parseRequest';

/** IANA zone used to interpret parser `date` + `time` (wall clock). Defaults to UTC. */
function defaultCalendarTimeZone(): string {
  return process.env.NYLAS_DEFAULT_TIMEZONE?.trim() || 'Etc/UTC';
}

function assertNylasConfig(): { apiKey: string; grantId: string } {
  const apiKey = process.env.NYLAS_API_KEY;
  const grantId = process.env.NYLAS_GRANT_ID;
  if (!apiKey || apiKey === 'get_from_nylas.com') {
    throw new Error('NYLAS_API_KEY is not configured. Add it to .env.local or your host environment.');
  }
  if (!grantId || grantId === 'your_connected_calendar_id') {
    throw new Error('NYLAS_GRANT_ID is not configured. Add it to .env.local or your host environment.');
  }
  return { apiKey, grantId };
}

function createClient(): Nylas {
  const { apiKey } = assertNylasConfig();
  return new Nylas({ apiKey });
}

function normalizeWallTime(time: string): string {
  const trimmed = time.trim();
  const [hRaw, mRaw] = trimmed.split(':');
  if (hRaw === undefined || mRaw === undefined) {
    throw new Error('time must be HH:mm (24h).');
  }
  const h = hRaw.padStart(2, '0');
  const m = mRaw.slice(0, 2).padStart(2, '0');
  return `${h}:${m}:00`;
}

function wallSlotToRange(date: string, time: string, durationMinutes: number, timeZone: string) {
  const wall = `${date.trim()}T${normalizeWallTime(time)}`;
  const start = fromZonedTime(wall, timeZone);
  const end = addMinutes(start, durationMinutes);
  return { start, end };
}

function toUnixSeconds(d: Date): number {
  return Math.floor(d.getTime() / 1000);
}

function rangesOverlapUnix(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

async function getGrantEmail(nylas: Nylas, grantId: string): Promise<string> {
  const res = await nylas.grants.find({ grantId });
  const email = res.data.email;
  if (!email) {
    throw new Error(
      'Connected Nylas grant has no email on file; Free/Busy requires an email. Reconnect the calendar in Nylas.'
    );
  }
  return email;
}

export interface BusyBlock {
  start: Date;
  end: Date;
}

export interface CheckAvailabilityResult {
  available: boolean;
  /** Email used for the Free/Busy query (from the grant). */
  grantEmail?: string;
  /** Busy intervals from Nylas that overlap the requested slot. */
  conflictingBusySlots?: BusyBlock[];
  /** Set when the slot cannot be confirmed free (API error or misconfiguration). */
  reason?: string;
}

/**
 * Uses Nylas Free/Busy for the connected grant to see if the wall-clock slot overlaps any busy block.
 *
 * @param date `YYYY-MM-DD`
 * @param time `HH:mm` (24h), interpreted in `NYLAS_DEFAULT_TIMEZONE` (default `Etc/UTC`)
 * @param duration slot length in minutes
 */
export async function checkAvailability(
  date: string,
  time: string,
  duration: number
): Promise<CheckAvailabilityResult> {
  const { grantId } = assertNylasConfig();
  const nylas = createClient();
  const tz = defaultCalendarTimeZone();

  if (!date.trim() || !time.trim()) {
    return { available: false, reason: 'date and time are required for availability.' };
  }
  if (!Number.isFinite(duration) || duration <= 0) {
    return { available: false, reason: 'duration must be a positive number of minutes.' };
  }

  const { start, end } = wallSlotToRange(date, time, duration, tz);
  const slotStart = toUnixSeconds(start);
  const slotEnd = toUnixSeconds(end);

  let grantEmail: string;
  try {
    grantEmail = await getGrantEmail(nylas, grantId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load grant.';
    return { available: false, reason: msg };
  }

  let response;
  try {
    response = await nylas.calendars.getFreeBusy({
      identifier: grantId,
      requestBody: {
        startTime: slotStart,
        endTime: slotEnd,
        emails: [grantEmail],
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Nylas Free/Busy request failed.';
    return { available: false, grantEmail, reason: msg };
  }

  const rows = response.data;
  const conflictingBusySlots: BusyBlock[] = [];

  for (const row of rows) {
    if (row.object === FreeBusyType.ERROR) {
      return {
        available: false,
        grantEmail,
        reason: row.error || 'Free/Busy error for grant email.',
      };
    }
    if (row.object !== FreeBusyType.FREE_BUSY) continue;

    for (const slot of row.timeSlots) {
      const busyStart = slot.startTime;
      const busyEnd = slot.endTime;
      if (rangesOverlapUnix(slotStart, slotEnd, busyStart, busyEnd)) {
        conflictingBusySlots.push({
          start: new Date(busyStart * 1000),
          end: new Date(busyEnd * 1000),
        });
      }
    }
  }

  return {
    available: conflictingBusySlots.length === 0,
    grantEmail,
    conflictingBusySlots: conflictingBusySlots.length ? conflictingBusySlots : undefined,
  };
}

export interface CreateCalendarEventResult {
  eventId: string;
  calendarId: string;
  htmlLink?: string;
}

/**
 * Creates an event on the grant's **primary** calendar from structured parser output.
 */
export async function createCalendarEvent(details: MeetingDetails): Promise<CreateCalendarEventResult> {
  const { grantId } = assertNylasConfig();
  const nylas = createClient();
  const tz = defaultCalendarTimeZone();

  if (!details.date?.trim() || !details.time?.trim()) {
    throw new Error('meeting_details.date and meeting_details.time are required to create an event.');
  }

  const duration = details.duration_minutes > 0 ? details.duration_minutes : 30;
  const { start, end } = wallSlotToRange(details.date, details.time, duration, tz);
  const startTime = toUnixSeconds(start);
  const endTime = toUnixSeconds(end);

  const title =
    (details.topic && details.topic.trim()) ||
    (details.attendee_name ? `Meeting with ${details.attendee_name}` : 'Calnize meeting');

  const descriptionParts = [
    details.attendee_name ? `Guest / attendee: ${details.attendee_name}` : null,
    details.topic ? `Topic: ${details.topic}` : null,
  ].filter(Boolean) as string[];

  const attendee = details.attendee_name?.trim();
  const participants =
    attendee && attendee.includes('@')
      ? [{ email: attendee, status: 'noreply' as const }]
      : undefined;

  const res = await nylas.events.create({
    identifier: grantId,
    queryParams: { calendarId: 'primary', notifyParticipants: true },
    requestBody: {
      title,
      description: descriptionParts.length ? descriptionParts.join('\n') : undefined,
      busy: true,
      when: {
        startTime,
        endTime,
        startTimezone: tz,
        endTimezone: tz,
      },
      participants,
    },
  });

  const ev = res.data;
  return {
    eventId: ev.id,
    calendarId: ev.calendarId,
    htmlLink: ev.htmlLink,
  };
}
