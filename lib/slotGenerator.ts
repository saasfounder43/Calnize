import { addMinutes, format, parseISO, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { AvailabilityRule, TimeSlot } from '@/types';

interface BusySlot {
    start: string;
    end: string;
}

interface SlotGeneratorParams {
    date: string; // YYYY-MM-DD
    durationMinutes: number;
    bufferMinutes: number;
    availabilityRules: AvailabilityRule[];
    existingBookings: BusySlot[];
    googleBusySlots: BusySlot[];
    hostTimezone: string;
}

export function generateTimeSlots(params: SlotGeneratorParams): TimeSlot[] {
    const {
        date,
        durationMinutes,
        bufferMinutes,
        availabilityRules,
        existingBookings,
        googleBusySlots,
        hostTimezone,
    } = params;

    // Determine the weekday for the given date (in host's timezone)
    const dateObj = new Date(`${date}T12:00:00`); // noon to avoid timezone edge cases
    const zonedDate = toZonedTime(dateObj, hostTimezone);
    const weekday = zonedDate.getDay(); // 0=Sunday, 6=Saturday

    // Filter availability rules for this weekday
    const rulesForDay = availabilityRules.filter((r) => r.weekday === weekday);

    if (rulesForDay.length === 0) {
        return [];
    }

    // Combine all busy slots
    const allBusySlots: BusySlot[] = [...existingBookings, ...googleBusySlots];

    const slots: TimeSlot[] = [];

    for (const rule of rulesForDay) {
        // Build start and end DateTime from the rule times + date
        const startDateTime = parseISO(`${date}T${rule.start_time}:00`);
        const endDateTime = parseISO(`${date}T${rule.end_time}:00`);

        let currentSlotStart = startDateTime;

        while (true) {
            const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);

            // Stop if this slot would go past the availability window
            if (isAfter(currentSlotEnd, endDateTime)) {
                break;
            }

            // Check if slot overlaps with any busy slot
            const isConflicting = allBusySlots.some((busy) => {
                const busyStart = parseISO(busy.start);
                const busyEnd = parseISO(busy.end);

                try {
                    return areIntervalsOverlapping(
                        { start: currentSlotStart, end: currentSlotEnd },
                        { start: busyStart, end: busyEnd }
                    );
                } catch {
                    return false;
                }
            });

            // Don't offer slots in the past
            const now = new Date();
            const isInPast = isBefore(currentSlotEnd, now);

            if (!isConflicting && !isInPast) {
                slots.push({
                    start: currentSlotStart.toISOString(),
                    end: currentSlotEnd.toISOString(),
                    available: true,
                });
            }

            // Move to next slot, including buffer time
            currentSlotStart = addMinutes(currentSlotEnd, bufferMinutes);
        }
    }

    return slots;
}
