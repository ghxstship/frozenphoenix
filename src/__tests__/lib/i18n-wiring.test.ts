import { beforeEach, describe, expect, it } from "vitest";

// ─── Dictionary & Deep Merge Tests ───────────────────────────

import { getDictionary } from "@/lib/i18n/dictionaries";
import type { TranslationNamespace } from "@/lib/i18n/types";

// Locales the system supports
const SUPPORTED_LOCALES = [
    "en-US",
    "en-GB",
    "fr-FR",
    "es-ES",
    "de-DE",
    "pt-BR",
    "ja-JP",
    "zh-CN",
    "ko-KR",
    "ar-SA",
] as const;

// All namespaces that must exist on every dictionary
const EXPECTED_NAMESPACES: TranslationNamespace[] = [
    "auth",
    "messaging",
    "common",
    "production",
    "finance",
    "crm",
    "contracts",
    "vendors",
    "assets",
    "approvals",
    "campaigns",
    "incidents",
    "settings",
    "scanning",
    "contextSwitcher",
    "shells",
];

/**
 * Recursively collect all leaf string paths from an object.
 * e.g. { a: { b: "x" }, c: "y" } → ["a.b", "c"]
 */
function leafPaths(obj: unknown, prefix = ""): string[] {
    if (typeof obj === "string") return [prefix];
    if (typeof obj !== "object" || obj === null) return [];
    const paths: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        paths.push(...leafPaths(value, prefix ? `${prefix}.${key}` : key));
    }
    return paths;
}

describe("getDictionary — dictionary completeness", () => {
    const enUS = getDictionary("en-US");
    const enUSLeaves = new Map<TranslationNamespace, string[]>();

    // Pre-compute the canonical leaf set
    for (const ns of EXPECTED_NAMESPACES) {
        enUSLeaves.set(ns, leafPaths(enUS[ns]));
    }

    it("en-US has all expected namespaces", () => {
        for (const ns of EXPECTED_NAMESPACES) {
            expect(enUS).toHaveProperty(ns);
        }
    });

    it("en-US has no undefined leaf values", () => {
        for (const ns of EXPECTED_NAMESPACES) {
            const leaves = enUSLeaves.get(ns)!;
            expect(leaves.length).toBeGreaterThan(0);
            for (const path of leaves) {
                const value = path
                    .split(".")
                    .reduce<unknown>(
                        (acc, part) =>
                            acc && typeof acc === "object"
                                ? (acc as Record<string, unknown>)[part]
                                : undefined,
                        enUS[ns]
                    );
                expect(value, `en-US.${ns}.${path} should be a string`).toEqual(expect.any(String));
            }
        }
    });

    for (const locale of SUPPORTED_LOCALES) {
        if (locale === "en-US") continue;

        it(`${locale} resolves to a complete dictionary via deep merge`, () => {
            const dict = getDictionary(locale);

            for (const ns of EXPECTED_NAMESPACES) {
                expect(dict, `${locale} missing namespace '${ns}'`).toHaveProperty(ns);

                const canonicalPaths = enUSLeaves.get(ns)!;
                for (const path of canonicalPaths) {
                    const value = path
                        .split(".")
                        .reduce<unknown>(
                            (acc, part) =>
                                acc && typeof acc === "object"
                                    ? (acc as Record<string, unknown>)[part]
                                    : undefined,
                            dict[ns]
                        );
                    expect(
                        typeof value,
                        `${locale}.${ns}.${path} should resolve to string (got ${typeof value})`
                    ).toBe("string");
                }
            }
        });
    }
});

describe("getDictionary — deep merge correctness", () => {
    it("en-GB overrides en-US for keys it defines", () => {
        const enGB = getDictionary("en-GB");
        // en-GB defines auth.signup.orgNameLabel as "Organisation Name"
        expect(enGB.auth.signup.orgNameLabel).toBe("Organisation Name");
    });

    it("en-GB falls back to en-US for keys it omits", () => {
        const enGB = getDictionary("en-GB");
        const enUS = getDictionary("en-US");
        // en-GB does not override auth.login.emailLabel
        expect(enGB.auth.login.emailLabel).toBe(enUS.auth.login.emailLabel);
    });

    it("fr-FR overrides en-US for defined keys", () => {
        const frFR = getDictionary("fr-FR");
        expect(frFR.common.action_save).toBe("Enregistrer");
        expect(frFR.auth.login.title).toBe("Bienvenue");
    });

    it("fr-FR falls back to en-US for omitted keys", () => {
        const frFR = getDictionary("fr-FR");
        const enUS = getDictionary("en-US");
        // fr-FR does not override scanning namespace
        expect(frFR.scanning.scanner.title).toBe(enUS.scanning.scanner.title);
    });
});

// ─── Locale Store Tests ──────────────────────────────────────

import { useLocaleStore } from "@/lib/i18n/locale-store";
import { getLanguageTagForLocale, getTextDirectionForLocale } from "@/lib/i18n/locale-store";

describe("locale-store", () => {
    beforeEach(() => {
        useLocaleStore.setState({ locale: "en-US" });
    });

    it("defaults to en-US", () => {
        expect(useLocaleStore.getState().locale).toBe("en-US");
    });

    it("setLocale updates the active locale", () => {
        useLocaleStore.getState().setLocale("fr-FR");
        expect(useLocaleStore.getState().locale).toBe("fr-FR");
    });

    it("setLocale persists across reads", () => {
        useLocaleStore.getState().setLocale("ja-JP");
        expect(useLocaleStore.getState().locale).toBe("ja-JP");
        // Another read
        const again = useLocaleStore.getState().locale;
        expect(again).toBe("ja-JP");
    });
});

describe("getLanguageTagForLocale", () => {
    it("extracts the language subtag", () => {
        expect(getLanguageTagForLocale("en-US")).toBe("en");
        expect(getLanguageTagForLocale("fr-FR")).toBe("fr");
        expect(getLanguageTagForLocale("ar-SA")).toBe("ar");
        expect(getLanguageTagForLocale("ja-JP")).toBe("ja");
        expect(getLanguageTagForLocale("zh-CN")).toBe("zh");
    });
});

describe("getTextDirectionForLocale", () => {
    it("returns rtl for Arabic", () => {
        expect(getTextDirectionForLocale("ar-SA")).toBe("rtl");
    });

    it("returns ltr for non-RTL locales", () => {
        expect(getTextDirectionForLocale("en-US")).toBe("ltr");
        expect(getTextDirectionForLocale("fr-FR")).toBe("ltr");
        expect(getTextDirectionForLocale("ja-JP")).toBe("ltr");
    });
});

// ─── translate() (non-hook) Tests ────────────────────────────

import { translate } from "@/lib/i18n/locale-provider";

describe("translate() — non-hook translation", () => {
    beforeEach(() => {
        useLocaleStore.setState({ locale: "en-US" });
    });

    it("looks up namespace.key correctly", () => {
        const result = translate("common", "action_save");
        expect(result).toBe("Save");
    });

    it("interpolates variables", () => {
        const result = translate("common", "toast_created", { entity: "Project" });
        expect(result).toBe("Project created successfully");
    });

    it("supports nested keys via dot notation", () => {
        const result = translate("auth", "login.title");
        expect(result).toBe("Welcome back");
    });

    it("returns the key as fallback for missing keys", () => {
        const result = translate("common", "nonexistent_key_xyz");
        expect(result).toBe("nonexistent_key_xyz");
    });

    it("respects locale changes", () => {
        useLocaleStore.setState({ locale: "fr-FR" });
        const result = translate("common", "action_save");
        expect(result).toBe("Enregistrer");
    });
});

// ─── Shells namespace key coverage ───────────────────────────

describe("shells namespace — topbar keys exist", () => {
    const dict = getDictionary("en-US");

    const requiredTopbarKeys = [
        "topbar_search",
        "topbar_search_label",
        "topbar_create_new",
        "topbar_help_title",
        "topbar_help_docs",
        "topbar_help_shortcuts",
        "topbar_help_support",
        "topbar_help_whats_new",
        "topbar_language",
        "topbar_open_nav",
        "topbar_more",
        "topbar_settings",
        "topbar_quick_create",
        "topbar_messages",
    ];

    for (const key of requiredTopbarKeys) {
        it(`shells.${key} is defined`, () => {
            expect(dict.shells).toHaveProperty(key);
            expect(typeof (dict.shells as Record<string, unknown>)[key]).toBe("string");
        });
    }
});
