/* ═══════════════════════════════════════════════════════════════
   I18N — Internationalization utility
   
   Provides type-safe access to locale strings with interpolation.
   Currently English-only; add additional locale files under
   locales/<lang>/ to support more languages.
   ═══════════════════════════════════════════════════════════════ */

import auth from "./locales/en/auth";
import type { AuthMessages } from "./locales/en/auth";

export type Locale = "en";

const locales: Record<Locale, { auth: AuthMessages }> = {
    en: { auth },
};

let currentLocale: Locale = "en";

export function setLocale(locale: Locale): void {
    currentLocale = locale;
}

export function getLocale(): Locale {
    return currentLocale;
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

export type { AuthMessages };
