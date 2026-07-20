export type OnboardingStepKey =
  | 'profession'
  | 'pricing'
  | 'meeting_format'
  | 'availability'
  | 'theme'
  | 'calendar'
  | 'done';

export const ONBOARDING_STEP_ORDER: OnboardingStepKey[] = [
  'profession',
  'pricing',
  'meeting_format',
  'availability',
  'theme',
  'calendar',
  'done',
];

/** The seven profession buckets shown in the original form (Step 1). */
export const PROFESSION_BUCKETS = [
  'consultant',
  'coach',
  'freelancer',
  'designer',
  'doctor',
  'sales_team',
  'other',
] as const;
export type ProfessionBucket = (typeof PROFESSION_BUCKETS)[number];

/** Maps the human-facing profession bucket to the internal userType used by createBookingType(). */
export function professionBucketToUserType(bucket: ProfessionBucket): string {
  switch (bucket) {
    case 'consultant':
      return 'consultation';
    case 'coach':
      return 'consultation';
    case 'freelancer':
      return 'discovery';
    case 'designer':
      return 'discovery';
    case 'doctor':
      return 'appointment';
    case 'sales_team':
      return 'demo';
    case 'other':
    default:
      return 'demo';
  }
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface ProfessionStepFields {
  profession_bucket: ProfessionBucket | null;
}

export interface PricingStepFields {
  charges: boolean | null;
  price: number | null;
  currency: Currency | null;
  payment_link: string | null;
}

export type MeetingMode = 'video' | 'phone' | 'in_person';

export interface MeetingFormatStepFields {
  mode: MeetingMode | null;
  meeting_link: string | null;
  location: string | null;
  auto_generate_meet: boolean;
}

export interface DayAvailabilityAnswer {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityStepFields {
  days: DayAvailabilityAnswer[] | null;
}

export interface ThemeStepFields {
  theme: string | null;
  skipped: boolean;
}

export type StepFields =
  | ProfessionStepFields
  | PricingStepFields
  | MeetingFormatStepFields
  | AvailabilityStepFields
  | ThemeStepFields;

export type ParseStatus = 'success' | 'missing_info' | 'unsupported';

export interface ParsedOnboardingStep<T = Record<string, unknown>> {
  status: ParseStatus;
  fields: T;
  clarification_needed: string;
}

/** Full accumulated onboarding answers, keyed by step. Persisted in onboarding_step_data. */
export interface OnboardingAnswers {
  profession?: ProfessionStepFields;
  pricing?: PricingStepFields;
  meeting_format?: MeetingFormatStepFields;
  availability?: AvailabilityStepFields;
  theme?: ThemeStepFields;
}