/* ═══════════════════════════════════════════════════════════════
   DICTIONARY REGISTRY — Maps SupportedLocale → translation dict.
   en-US is canonical (complete). All others are partial overrides
   that fall back to en-US for missing keys.
   ═══════════════════════════════════════════════════════════════ */

import type { SupportedLocale } from "@/lib/formatters/locale";
import type { PartialTranslationDictionary, TranslationDictionary } from "../types";
import { enUS } from "./en-US";
import { enGB } from "./en-GB";
import { esES } from "./es-ES";
import { frFR } from "./fr-FR";
import { deDE } from "./de-DE";
import { ptBR } from "./pt-BR";
import { jaJP } from "./ja-JP";
import { zhCN } from "./zh-CN";
import { arSA } from "./ar-SA";
import { koKR } from "./ko-KR";

/** Partial dictionaries for each non-canonical locale. */
const partialDictionaries: Partial<Record<SupportedLocale, PartialTranslationDictionary>> = {
    "en-GB": enGB,
    "es-ES": esES,
    "fr-FR": frFR,
    "de-DE": deDE,
    "pt-BR": ptBR,
    "ja-JP": jaJP,
    "zh-CN": zhCN,
    "ar-SA": arSA,
    "ko-KR": koKR,
};

/**
 * Deep merge a partial dictionary over the canonical en-US.
 * Missing keys in the partial fall through to en-US values.
 */
function deepMerge<T>(base: T, override: unknown): T {
    if (override === undefined || override === null) return base;
    if (typeof base !== "object" || base === null) return (override as T) ?? base;

    const result = { ...base } as Record<string, unknown>;
    const overrideObj = override as Record<string, unknown>;

    for (const key of Object.keys(overrideObj)) {
        if (key in result) {
            result[key] = deepMerge(result[key], overrideObj[key]);
        }
    }

    return result as T;
}

/** Cache of fully-resolved dictionaries per locale. */
const resolvedCache = new Map<SupportedLocale, TranslationDictionary>();

/**
 * Get the fully-resolved translation dictionary for a locale.
 * Always returns a complete dictionary (en-US fallback for missing keys).
 */
export function getDictionary(locale: SupportedLocale): TranslationDictionary {
    // en-US is canonical — no merge needed
    if (locale === "en-US") return enUS;

    // Check cache
    const cached = resolvedCache.get(locale);
    if (cached) return cached;

    // Merge partial over en-US
    const partial = partialDictionaries[locale];
    if (!partial) return enUS; // Unknown locale → fallback

    const resolved = deepMerge(enUS, partial);
    resolvedCache.set(locale, resolved);
    return resolved;
}

/** Export canonical dictionary for direct import. */
export { enUS };
