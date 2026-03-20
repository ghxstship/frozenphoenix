import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Resolve the user's preferred locale, falling back to en-US. */
function resolveLocale(locale?: string): string {
    if (locale) return locale;
    if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
    return "en-US";
}

export function formatCurrency(amount: number, currency: string = "USD", locale?: string): string {
    return new Intl.NumberFormat(resolveLocale(locale), {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string | Date, locale?: string): string {
    return new Intl.DateTimeFormat(resolveLocale(locale), {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date, locale?: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    const resolved = resolveLocale(locale);

    // Use Intl.RelativeTimeFormat when available for proper localization
    try {
        const rtf = new Intl.RelativeTimeFormat(resolved, { numeric: "auto" });
        if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
        const diffMin = Math.floor(diffSec / 60);
        if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
        const diffHr = Math.floor(diffMin / 60);
        if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, "hour");
        const diffDays = Math.floor(diffHr / 24);
        if (Math.abs(diffDays) < 7) return rtf.format(-diffDays, "day");
        if (Math.abs(diffDays) < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
    } catch {
        // Fallback for environments without RelativeTimeFormat
    }
    return formatDate(date, resolved);
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function humanizeSnakeCase(text: string): string {
    return text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
    return text.length > length ? text.slice(0, length) + "…" : text;
}

export function formatCompactCurrency(amount: number): string {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
}

export function percentChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
}
