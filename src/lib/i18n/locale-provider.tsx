"use client";

/* ═══════════════════════════════════════════════════════════════
   LOCALE PROVIDER — React context for i18n.
   
   Responsibilities:
   1. Provides the active locale + resolved translation dictionary
   2. Applies lang + dir attributes to <html>
   3. Persists locale to cookie for SSR hint
   4. Exposes useTranslation() hook with namespace + interpolation
   ═══════════════════════════════════════════════════════════════ */

import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { SupportedLocale } from "@/lib/formatters/locale";
import { logger } from "@/lib/logger";
import { getLanguageTagForLocale, getTextDirectionForLocale, useLocaleStore } from "./locale-store";
import { getDictionary } from "./dictionaries";
import type { TranslationDictionary, TranslationNamespace } from "./types";

// ─── Context ──────────────────────────────────────────────────

interface LocaleContextValue {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
    dictionary: TranslationDictionary;
    dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: "en-US",
    setLocale: () => {},
    dictionary: getDictionary("en-US"),
    dir: "ltr",
});

// ─── Provider ─────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const locale = useLocaleStore((s) => s.locale);
    const setLocaleStore = useLocaleStore((s) => s.setLocale);

    const dir = useMemo(() => getTextDirectionForLocale(locale), [locale]);
    const dictionary = useMemo(() => getDictionary(locale), [locale]);

    // Apply locale to DOM + cookie
    useEffect(() => {
        const html = document.documentElement;
        const lang = getLanguageTagForLocale(locale);
        html.lang = lang;
        html.dir = dir;

        // Persist as cookie for SSR hint
        document.cookie = `fp-locale=${locale};path=/;max-age=31536000;SameSite=Lax`;

        // Also keep legacy localStorage key in sync for locale.ts formatters
        localStorage.setItem("fp-locale", locale);
    }, [locale, dir]);

    const contextValue = useMemo<LocaleContextValue>(
        () => ({
            locale,
            setLocale: setLocaleStore,
            dictionary,
            dir,
        }),
        [locale, setLocaleStore, dictionary, dir]
    );

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────

/**
 * Access the full locale context (locale, setLocale, dir, dictionary).
 */
export function useLocale() {
    return useContext(LocaleContext);
}

/**
 * Namespace-scoped translation hook.
 * Returns a `t(key, vars?)` function that looks up keys in the
 * specified namespace of the active locale's dictionary.
 *
 * @example
 * const { t } = useTranslation("common");
 * t("action_save")           // → "Save" (en-US) / "Guardar" (es-ES)
 * t("toast_created", { entity: "Project" }) // → "Project created successfully"
 *
 * @example Nested keys (dot notation)
 * const { t } = useTranslation("auth");
 * t("login.title")           // → "Welcome back" (en-US) / "Bienvenido de nuevo" (es-ES)
 */
export function useTranslation<NS extends TranslationNamespace>(namespace: NS) {
    const { dictionary, locale, dir } = useContext(LocaleContext);

    const nsDict = dictionary[namespace];

    const t = useCallback(
        (key: string, vars?: Record<string, string | number>): string => {
            const value = getNestedValue(nsDict, key);
            if (typeof value !== "string") {
                // Fallback: return the key itself (development aid)
                if (process.env.NODE_ENV === "development") {
                    logger.warn(`[i18n] Missing key: ${namespace}.${key} for locale ${locale}`);
                }
                return key;
            }
            if (!vars) return value;
            return interpolate(value, vars);
        },
        [nsDict, namespace, locale]
    );

    return { t, locale, dir };
}

/**
 * Raw translation function (non-hook, for use outside React).
 * Reads directly from the Zustand store.
 */
export function translate(
    namespace: TranslationNamespace,
    key: string,
    vars?: Record<string, string | number>
): string {
    const locale = useLocaleStore.getState().locale;
    const dict = getDictionary(locale);
    const nsDict = dict[namespace];
    const value = getNestedValue(nsDict, key);
    if (typeof value !== "string") return key;
    if (!vars) return value;
    return interpolate(value, vars);
}

// ─── Internals ────────────────────────────────────────────────

function getNestedValue(obj: unknown, path: string): unknown {
    return path
        .split(".")
        .reduce<unknown>(
            (acc, part) =>
                acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
            obj
        );
}

function interpolate(template: string, vars: Record<string, string | number>): string {
    return Object.entries(vars).reduce(
        (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
        template
    );
}
