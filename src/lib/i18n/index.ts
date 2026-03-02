/* ═══════════════════════════════════════════════════════════════
   I18N — Internationalization utility
   
   H-002: Provides type-safe access to locale strings with
   interpolation, namespace loading, and React hook.
   
   Add locale files under messages/<locale>.json to support
   more languages. Auth strings live in locales/en/auth.ts
   for backward compatibility.
   ═══════════════════════════════════════════════════════════════ */

import auth from "./locales/en/auth";
import type { AuthMessages } from "./locales/en/auth";
import enUS from "./messages/en-US.json";

export type Locale = "en";

// Full message catalog: structured JSON + legacy auth module
export interface Messages {
    auth: AuthMessages;
    common: typeof enUS.common;
    nav: typeof enUS.nav;
    errors: typeof enUS.errors;
    table: typeof enUS.table;
    cookies: typeof enUS.cookies;
}

const locales: Record<Locale, Messages> = {
    en: {
        auth,
        common: enUS.common,
        nav: enUS.nav,
        errors: enUS.errors,
        table: enUS.table,
        cookies: enUS.cookies,
    },
};

let currentLocale: Locale = "en";

export function setLocale(locale: Locale): void {
    currentLocale = locale;
}

export function getLocale(): Locale {
    return currentLocale;
}

/**
 * Get the full message catalog for the current locale.
 */
export function getMessages(): Messages {
    return locales[currentLocale];
}

/**
 * Get the full auth messages object for the current locale.
 */
export function getAuthMessages(): AuthMessages {
    return locales[currentLocale].auth;
}

/**
 * Interpolate template strings like "Hello {name}" with values.
 */
export function t(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template;
    return Object.entries(vars).reduce(
        (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
        template
    );
}

/**
 * Namespace-scoped translation helper.
 * Usage: const tc = scopedT("common"); tc("save") → "Save"
 */
export function scopedT(namespace: keyof Messages) {
    const messages = locales[currentLocale][namespace];
    return (key: string, vars?: Record<string, string | number>): string => {
        const value = getNestedValue(messages, key);
        if (typeof value !== "string") return key;
        return t(value, vars);
    };
}

function getNestedValue(obj: unknown, path: string): unknown {
    return path
        .split(".")
        .reduce<unknown>(
            (acc, part) =>
                acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
            obj
        );
}

export type { AuthMessages };
