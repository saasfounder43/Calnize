import {
  CURRENCIES,
  PROFESSION_BUCKETS,
  type AvailabilityStepFields,
  type Currency,
  type DayAvailabilityAnswer,
  type MeetingFormatStepFields,
  type MeetingMode,
  type OnboardingStepKey,
  type PricingStepFields,
  type ProfessionBucket,
  type ProfessionStepFields,
  type ThemeStepFields,
} from '@/lib/onboarding/types';

export interface ValidationResult<T> {
  valid: boolean;
  /** Present when valid — the cleaned, safe-to-persist fields. */
  cleaned?: T;
  /** Present when invalid — a user-facing reason, never a raw error/stack. */
  error?: string;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const VALID_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const MAX_PRICE = 100000; // sanity ceiling — catches obvious LLM misparses like $50 -> 5000
const URL_RE = /^https?:\/\/.+/i;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateProfession(fields: Record<string, unknown>): ValidationResult<ProfessionStepFields> {
  const bucket = fields.profession_bucket;
  if (typeof bucket !== 'string' || !PROFESSION_BUCKETS.includes(bucket as ProfessionBucket)) {
    return { valid: false, error: 'Could you tell me what you do — consultant, coach, freelancer, designer, doctor, sales, or something else?' };
  }
  return { valid: true, cleaned: { profession_bucket: bucket as ProfessionBucket } };
}

function validatePricing(fields: Record<string, unknown>): ValidationResult<PricingStepFields> {
  const charges = fields.charges;
  if (typeof charges !== 'boolean') {
    return { valid: false, error: 'Just to confirm — do you charge for your meetings, yes or no?' };
  }

  if (!charges) {
    return {
      valid: true,
      cleaned: { charges: false, price: null, currency: null, payment_link: null },
    };
  }

  const rawPrice = fields.price;
  const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
    return { valid: false, error: 'What price would you like to charge per meeting?' };
  }

  const rawCurrency = typeof fields.currency === 'string' ? fields.currency.toUpperCase() : 'USD';
  const currency: Currency = (CURRENCIES as readonly string[]).includes(rawCurrency)
    ? (rawCurrency as Currency)
    : 'USD';

  let paymentLink: string | null = null;
  if (typeof fields.payment_link === 'string' && fields.payment_link.trim()) {
    const trimmed = fields.payment_link.trim();
    if (!URL_RE.test(trimmed)) {
      return { valid: false, error: 'That doesn\'t look like a valid link — could you share the full payment link (starting with https://)?' };
    }
    paymentLink = trimmed;
  }

  return {
    valid: true,
    cleaned: { charges: true, price: Math.round(price * 100) / 100, currency, payment_link: paymentLink },
  };
}

function validateMeetingFormat(fields: Record<string, unknown>): ValidationResult<MeetingFormatStepFields> {
  const mode = fields.mode;
  if (mode !== 'video' && mode !== 'phone' && mode !== 'in_person') {
    return { valid: false, error: 'Will you meet by video call, phone, or in person?' };
  }

  if (mode === 'in_person') {
    const location = typeof fields.location === 'string' ? fields.location.trim() : '';
    if (!location) {
      return { valid: false, error: 'What location should clients meet you at?' };
    }
    return {
      valid: true,
      cleaned: { mode: 'in_person' as MeetingMode, meeting_link: null, location, auto_generate_meet: false },
    };
  }

  if (mode === 'video') {
    let meetingLink: string | null = null;
    if (typeof fields.meeting_link === 'string' && fields.meeting_link.trim()) {
      const trimmed = fields.meeting_link.trim();
      if (!URL_RE.test(trimmed)) {
        return { valid: false, error: 'That doesn\'t look like a valid link — could you paste the full meeting link (starting with https://)?' };
      }
      meetingLink = trimmed;
    }
    const autoGenerate = meetingLink ? false : fields.auto_generate_meet !== false;
    return {
      valid: true,
      cleaned: { mode: 'video' as MeetingMode, meeting_link: meetingLink, location: null, auto_generate_meet: autoGenerate },
    };
  }

  // phone
  return { valid: true, cleaned: { mode: 'phone' as MeetingMode, meeting_link: null, location: null, auto_generate_meet: false } };
}

function validateAvailability(fields: Record<string, unknown>): ValidationResult<AvailabilityStepFields> {
  const days = fields.days;
  if (!Array.isArray(days) || days.length === 0) {
    return { valid: false, error: 'Which days and hours are you generally available?' };
  }

  const cleanedDays: DayAvailabilityAnswer[] = [];
  const seen = new Set<string>();

  for (const raw of days) {
    if (!isPlainObject(raw)) continue;
    const day = typeof raw.day === 'string' ? raw.day.trim() : '';
    if (!VALID_DAYS.includes(day) || seen.has(day)) continue;
    seen.add(day);

    const enabled = raw.enabled === true;
    const startTime = typeof raw.startTime === 'string' && TIME_RE.test(raw.startTime) ? raw.startTime : '09:00';
    const endTime = typeof raw.endTime === 'string' && TIME_RE.test(raw.endTime) ? raw.endTime : '17:00';

    if (enabled && startTime >= endTime) {
      return { valid: false, error: `Your ${day} start time needs to be before your end time — could you clarify?` };
    }

    cleanedDays.push({ day, enabled, startTime, endTime });
  }

  // Fill in any missing days as disabled defaults so we always have all 7.
  for (const day of VALID_DAYS) {
    if (!seen.has(day)) {
      cleanedDays.push({ day, enabled: false, startTime: '09:00', endTime: '17:00' });
    }
  }

  if (!cleanedDays.some((d) => d.enabled)) {
    return { valid: false, error: 'You\'ll need at least one available day — which days work for you?' };
  }

  return { valid: true, cleaned: { days: cleanedDays } };
}

function validateTheme(fields: Record<string, unknown>): ValidationResult<ThemeStepFields> {
  const skipped = fields.skipped === true || !fields.theme;
  const theme = !skipped && typeof fields.theme === 'string' ? fields.theme.trim().slice(0, 40) : null;
  return { valid: true, cleaned: { theme, skipped: skipped || !theme } };
}

export function validateStepAnswer(
  step: OnboardingStepKey,
  fields: Record<string, unknown>
): ValidationResult<unknown> {
  switch (step) {
    case 'profession':
      return validateProfession(fields);
    case 'pricing':
      return validatePricing(fields);
    case 'meeting_format':
      return validateMeetingFormat(fields);
    case 'availability':
      return validateAvailability(fields);
    case 'theme':
      return validateTheme(fields);
    default:
      return { valid: false, error: 'Hmm, I\'m not sure how to handle that step — let\'s try again.' };
  }
}