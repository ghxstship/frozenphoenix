/* ═══════════════════════════════════════════════════════════════
   LOCALE STORE — Zustand persisted store for active locale.
   SSOT for the user's language preference.
   Consumed by LocaleProvider, locale.ts formatters, and topbar.
   ═══════════════════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedLocale, TextDirection } from "@/lib/formatters/locale";

interface LocaleStore {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
}

const RTL_LOCALES: SupportedLocale[] = ["ar-SA"];

export function getTextDirectionForLocale(locale: SupportedLocale): TextDirection {
    return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

export function getLanguageTagForLocale(locale: SupportedLocale): string {
    return locale.split("-")[0] ?? "en";
}

export const useLocaleStore = create<LocaleStore>()(
    persist(
        (set) => ({
            locale: "en-US",
            setLocale: (locale) => set({ locale }),
        }),
        {
            name: "fp-locale-store",
            onRehydrateStorage: () => (state) => {
                if (typeof window === "undefined" || !state) return;
                // Migrate from legacy plain-string "fp-locale" key
                const legacy = localStorage.getItem("fp-locale");
                if (legacy && !legacy.startsWith("{") && legacy !== state.locale) {
                    state.locale = legacy as SupportedLocale;
                }
            },
        }
    )
);
