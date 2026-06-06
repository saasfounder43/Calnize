import { addMinutes, format, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import type { AvailabilityRule, TimeSlot } from '@/types';

interface BusySlot {
    start: string;
    end: string;
}

interface SlotGeneratorParams {
    date: string; // YYYY-MM-DD
    durationMinutes: number;
    bufferMinutes: number;
    minimumNoticeMinutes?: number;
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
        minimumNoticeMinutes = 0,
        availabilityRules,
        existingBookings,
        googleBusySlots,
        hostTimezone,
    } = params;

    // Determine the weekday for the given date (in host's timezone)
    // We parse the date manually to avoid any local timezone shifts
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
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
        // Build start and end DateTime from the rule times + date in HOST timezone
        // We use TZ library to create a date that represents that local time in the host's zone
        const hostStartStr = `${date} ${rule.start_time}`;
        const hostEndStr = `${date} ${rule.end_time}`;

        // Create Date objects in UTC that correspond to the host's local wall clock
        // For example, if host is IST and rule is 09:00, we want the UTC time that is 09:00 IST
        const startDateTime = fromZonedTime(hostStartStr, hostTimezone);
        const endDateTime = fromZonedTime(hostEndStr, hostTimezone);

        let currentSlotStart = startDateTime;

        while (true) {
            const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);

            // Stop if this slot would go past the availability window
            if (isAfter(currentSlotEnd, endDateTime)) {
                break;
            }

            // Check if slot overlaps with any busy slot
            const isConflicting = allBusySlots.some((busy) => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);

                try {
                    return areIntervalsOverlapping(
                        { start: currentSlotStart, end: currentSlotEnd },
                        { start: busyStart, end: busyEnd }
                    );
                } catch {
                    return false;
                }
            });

            // Don't offer slots in the past or within minimum notice period
            const now = new Date();
            const minAllowedStartTime = addMinutes(now, minimumNoticeMinutes);
            const isTooSoon = isBefore(currentSlotStart, minAllowedStartTime);

            if (!isConflicting && !isTooSoon) {
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
