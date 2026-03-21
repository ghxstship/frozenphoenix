/* ═══════════════════════════════════════════════════════════════
   LOCALE UTILITIES — Internationalization Foundation
   ═══════════════════════════════════════════════════════════════
   
   Single source of truth for locale-aware formatting.
   All formatters reference the active locale from context or env.
   
   3NF Compliance:
   - Locale defined once, consumed everywhere
   - No hardcoded "en-US" in components or pages
   ═══════════════════════════════════════════════════════════════ */

export type SupportedLocale =
    | "en-US"
    | "en-GB"
    | "es-ES"
    | "fr-FR"
    | "de-DE"
    | "pt-BR"
    | "ja-JP"
    | "zh-CN"
    | "ar-SA"
    | "ko-KR";

export type TextDirection = "ltr" | "rtl";

const RTL_LOCALES: SupportedLocale[] = ["ar-SA"];

export function getTextDirection(locale: SupportedLocale): TextDirection {
    return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

function getLocale(): SupportedLocale {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("fp-locale");
        if (stored) return stored as SupportedLocale;
    }
    return (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "en-US";
}

/**
 * H-004: Extract BCP-47 language tag from a locale (e.g. "en-US" → "en").
 * Used by RootLayout to set the `<html lang>` attribute.
 */
export function getLanguageTag(locale?: SupportedLocale): string {
    const l = locale ?? getDefaultLocale();
    return l.split("-")[0] ?? "en";
}

/**
 * Server-safe default locale (no window/localStorage).
 */
export function getDefaultLocale(): SupportedLocale {
    return (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "en-US";
}

export function formatCurrency(
    amount: number,
    currency: string = "USD",
    locale?: SupportedLocale
): string {
    const l = locale ?? getLocale();
    return new Intl.NumberFormat(l, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatCurrencyPrecise(
    amount: number,
    currency: string = "USD",
    locale?: SupportedLocale
): string {
    const l = locale ?? getLocale();
    return new Intl.NumberFormat(l, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatCompactCurrency(
    amount: number,
    currency: string = "USD",
    locale?: SupportedLocale
): string {
    const l = locale ?? getLocale();
    return new Intl.NumberFormat(l, {
        style: "currency",
        currency,
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(amount);
}

export function formatNumber(value: number, locale?: SupportedLocale): string {
    const l = locale ?? getLocale();
    return new Intl.NumberFormat(l).format(value);
}

export function formatPercent(value: number, locale?: SupportedLocale): string {
    const l = locale ?? getLocale();
    return new Intl.NumberFormat(l, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value / 100);
}

export function formatDate(
    date: string | Date,
    style: "compact" | "short" | "medium" | "long" | "full" = "medium",
    locale?: SupportedLocale
): string {
    const l = locale ?? getLocale();
    const dateStyles: Record<string, Intl.DateTimeFormatOptions> = {
        compact: { month: "short", day: "numeric" },
        short: { month: "numeric", day: "numeric", year: "2-digit" },
        medium: { month: "short", day: "numeric", year: "numeric" },
        long: { month: "long", day: "numeric", year: "numeric" },
        full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    };
    return new Intl.DateTimeFormat(l, dateStyles[style]).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale?: SupportedLocale): string {
    const l = locale ?? getLocale();
    return new Intl.DateTimeFormat(l, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date, locale?: SupportedLocale): string {
    const l = locale ?? getLocale();
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(l, { numeric: "auto" });

    if (diffSeconds < 60) return rtf.format(-diffSeconds, "second");
    if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
    if (diffHours < 24) return rtf.format(-diffHours, "hour");
    if (diffDays < 7) return rtf.format(-diffDays, "day");
    if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
    if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), "month");
    return rtf.format(-Math.floor(diffDays / 365), "year");
}

export function formatTime(date: string | Date, locale?: SupportedLocale): string {
    const l = locale ?? getLocale();
    return new Intl.DateTimeFormat(l, {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}
