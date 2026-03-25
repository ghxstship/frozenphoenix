/* ═══════════════════════════════════════════════════════════════
   NLP DATE PARSER — Natural Language Date/Time Parsing (GAP-SCH-01)

   Lightweight parser for natural-language date expressions.
   Supports:
   - Relative: "tomorrow", "next Tuesday", "in 3 days", "in 2 weeks"
   - Absolute: "March 15", "March 15, 2026", "3/15/2026"
   - Time: "2pm", "at 14:00", "next Tuesday at 2pm"
   - Combined: "next Friday at 3:30pm"

   Zero external dependencies — uses a custom regex-based parser
   to avoid adding chrono-node to the bundle.
   ═══════════════════════════════════════════════════════════════ */

export interface ParsedDate {
    date: Date;
    /** The portion of the input that was interpreted */
    text: string;
    /** Whether a specific time was found */
    hasTime: boolean;
}

const DAY_NAMES = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const;

const MONTH_NAMES = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
] as const;

const MONTH_ABBRS: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
};

// ─── Time Parsing ────────────────────────────────────────────

function parseTimeComponent(input: string): { hours: number; minutes: number } | null {
    // "2pm", "2:30pm", "14:00", "at 2pm", "at 14:30"
    const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const match = input.match(timeRegex);
    if (!match) return null;

    let hours = parseInt(match[1]!, 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return { hours, minutes };
}

// ─── Relative Date Parsing ───────────────────────────────────

function parseRelativeDate(input: string, now: Date): ParsedDate | null {
    const lower = input.toLowerCase().trim();

    // "today"
    if (lower.startsWith("today")) {
        const result = new Date(now);
        const time = parseTimeComponent(lower);
        if (time) {
            result.setHours(time.hours, time.minutes, 0, 0);
            return { date: result, text: input, hasTime: true };
        }
        return { date: result, text: input, hasTime: false };
    }

    // "tomorrow"
    if (lower.startsWith("tomorrow")) {
        const result = new Date(now);
        result.setDate(result.getDate() + 1);
        const time = parseTimeComponent(lower);
        if (time) {
            result.setHours(time.hours, time.minutes, 0, 0);
            return { date: result, text: input, hasTime: true };
        }
        return { date: result, text: input, hasTime: false };
    }

    // "yesterday"
    if (lower.startsWith("yesterday")) {
        const result = new Date(now);
        result.setDate(result.getDate() - 1);
        const time = parseTimeComponent(lower);
        if (time) {
            result.setHours(time.hours, time.minutes, 0, 0);
            return { date: result, text: input, hasTime: true };
        }
        return { date: result, text: input, hasTime: false };
    }

    // "in X days/weeks/months"
    const inPattern = /^in\s+(\d+)\s+(day|days|week|weeks|month|months)/i;
    const inMatch = lower.match(inPattern);
    if (inMatch) {
        const count = parseInt(inMatch[1]!, 10);
        const unit = inMatch[2]!.toLowerCase();
        const result = new Date(now);

        if (unit.startsWith("day")) {
            result.setDate(result.getDate() + count);
        } else if (unit.startsWith("week")) {
            result.setDate(result.getDate() + count * 7);
        } else if (unit.startsWith("month")) {
            result.setMonth(result.getMonth() + count);
        }

        const time = parseTimeComponent(lower);
        if (time) {
            result.setHours(time.hours, time.minutes, 0, 0);
            return { date: result, text: input, hasTime: true };
        }
        return { date: result, text: input, hasTime: false };
    }

    // "next [day of week]"
    const nextDayPattern = /^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i;
    const nextDayMatch = lower.match(nextDayPattern);
    if (nextDayMatch) {
        const targetDay = DAY_NAMES.indexOf(
            nextDayMatch[1]!.toLowerCase() as (typeof DAY_NAMES)[number]
        );
        if (targetDay >= 0) {
            const result = new Date(now);
            const currentDay = result.getDay();
            let daysUntil = targetDay - currentDay;
            if (daysUntil <= 0) daysUntil += 7;
            result.setDate(result.getDate() + daysUntil);

            const time = parseTimeComponent(lower);
            if (time) {
                result.setHours(time.hours, time.minutes, 0, 0);
                return { date: result, text: input, hasTime: true };
            }
            return { date: result, text: input, hasTime: false };
        }
    }

    return null;
}

// ─── Absolute Date Parsing ───────────────────────────────────

function parseAbsoluteDate(input: string, now: Date): ParsedDate | null {
    const lower = input.toLowerCase().trim();

    // "March 15" or "March 15, 2026"
    const monthNamePattern =
        /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:,?\s+(\d{4}))?/i;
    const monthMatch = lower.match(monthNamePattern);
    if (monthMatch) {
        const monthStr = monthMatch[1]!.toLowerCase();
        const month =
            MONTH_ABBRS[monthStr.slice(0, 3)] ??
            MONTH_NAMES.indexOf(monthStr as (typeof MONTH_NAMES)[number]);
        const day = parseInt(monthMatch[2]!, 10);
        const year = monthMatch[3] ? parseInt(monthMatch[3], 10) : now.getFullYear();

        if (month >= 0 && day >= 1 && day <= 31) {
            const result = new Date(year, month, day);
            const time = parseTimeComponent(lower);
            if (time) {
                result.setHours(time.hours, time.minutes, 0, 0);
                return { date: result, text: input, hasTime: true };
            }
            return { date: result, text: input, hasTime: false };
        }
    }

    // "3/15/2026" or "3/15"
    const slashPattern = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?/;
    const slashMatch = lower.match(slashPattern);
    if (slashMatch) {
        const month = parseInt(slashMatch[1]!, 10) - 1;
        const day = parseInt(slashMatch[2]!, 10);
        let year = slashMatch[3] ? parseInt(slashMatch[3], 10) : now.getFullYear();
        if (year < 100) year += 2000;

        if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const result = new Date(year, month, day);
            const time = parseTimeComponent(lower);
            if (time) {
                result.setHours(time.hours, time.minutes, 0, 0);
                return { date: result, text: input, hasTime: true };
            }
            return { date: result, text: input, hasTime: false };
        }
    }

    return null;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Parse a natural language date/time string.
 * Returns null if the input cannot be parsed.
 */
export function parseNaturalDate(
    input: string,
    referenceDate?: Date | undefined
): ParsedDate | null {
    if (!input || !input.trim()) return null;

    const now = referenceDate ?? new Date();

    // Try relative first
    const relative = parseRelativeDate(input, now);
    if (relative) return relative;

    // Try absolute
    const absolute = parseAbsoluteDate(input, now);
    if (absolute) return absolute;

    return null;
}

/**
 * Format a parsed date into a human-readable preview string.
 */
export function formatParsedPreview(date: Date, hasTime = false): string {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const dayName = dayNames[date.getDay()]!;
    const monthName = monthNames[date.getMonth()]!;
    const day = date.getDate();
    const year = date.getFullYear();

    let result = `${dayName}, ${monthName} ${day}, ${year}`;

    if (hasTime) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const meridiem = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, "0");
        result += ` at ${displayHours}:${displayMinutes} ${meridiem}`;
    }

    return result;
}
