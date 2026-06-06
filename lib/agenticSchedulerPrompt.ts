import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/** Placeholder in prompt templates; replace at runtime with the real calendar date. */
export const AGENTIC_SCHEDULER_CURRENT_DATE_PLACEHOLDER = '{{current_date}}';

const DEFAULT_TEMPLATE = `Today's Date is: ${AGENTIC_SCHEDULER_CURRENT_DATE_PLACEHOLDER} (Provide this dynamically).`;

/**
 * Returns "today" as YYYY-MM-DD and a human-readable line, using server time or an optional IANA timezone.
 * Replaces every occurrence of {{current_date}} in the template (defaults to a single-line rule).
 */
export function injectCurrentDateIntoSchedulerPrompt(
  template: string = DEFAULT_TEMPLATE,
  reference: Date = new Date(),
  timeZone?: string
): string {
  const zoned = timeZone ? toZonedTime(reference, timeZone) : reference;
  const iso = format(zoned, 'yyyy-MM-dd');
  const human = format(zoned, 'EEEE, MMMM d, yyyy');
  const replacement = `${iso} (${human})`;
  return template.split(AGENTIC_SCHEDULER_CURRENT_DATE_PLACEHOLDER).join(replacement);
}
