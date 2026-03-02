import { describe, expect, it } from "vitest";
import {
    formatCurrency,
    formatDate,
    formatNumber,
    formatPercent,
    formatRelativeTime,
    getDefaultLocale,
    getLanguageTag,
    getTextDirection,
} from "@/lib/locale";
import type { SupportedLocale } from "@/lib/locale";

describe("getTextDirection", () => {
    it("returns rtl for Arabic", () => {
        expect(getTextDirection("ar-SA")).toBe("rtl");
    });

    it("returns ltr for English", () => {
        expect(getTextDirection("en-US")).toBe("ltr");
    });

    it("returns ltr for all non-RTL locales", () => {
        const ltrLocales: SupportedLocale[] = [
            "en-US",
            "en-GB",
            "es-ES",
            "fr-FR",
            "de-DE",
            "pt-BR",
            "ja-JP",
            "zh-CN",
            "ko-KR",
        ];
        for (const locale of ltrLocales) {
            expect(getTextDirection(locale)).toBe("ltr");
        }
    });
});

describe("getLanguageTag", () => {
    it("extracts language from locale", () => {
        expect(getLanguageTag("en-US")).toBe("en");
        expect(getLanguageTag("fr-FR")).toBe("fr");
        expect(getLanguageTag("ar-SA")).toBe("ar");
        expect(getLanguageTag("ja-JP")).toBe("ja");
    });

    it("falls back to en when no locale specified", () => {
        expect(getLanguageTag()).toBe("en");
    });
});

describe("getDefaultLocale", () => {
    it("returns en-US when no env var is set", () => {
        expect(getDefaultLocale()).toBe("en-US");
    });
});

describe("formatCurrency", () => {
    it("formats USD amounts", () => {
        const result = formatCurrency(1500, "USD", "en-US");
        expect(result).toContain("1,500");
    });

    it("formats with different locales", () => {
        const result = formatCurrency(1500, "EUR", "de-DE");
        expect(result).toContain("1.500");
    });
});

describe("formatNumber", () => {
    it("formats with thousands separators", () => {
        const result = formatNumber(1234567, "en-US");
        expect(result).toBe("1,234,567");
    });
});

describe("formatPercent", () => {
    it("formats as percentage", () => {
        const result = formatPercent(75, "en-US");
        expect(result).toBe("75%");
    });

    it("handles decimal percentages", () => {
        const result = formatPercent(33.3, "en-US");
        expect(result).toBe("33.3%");
    });
});

describe("formatDate", () => {
    it("formats in medium style", () => {
        // Use full ISO timestamp to avoid timezone-shift issues
        const result = formatDate("2025-01-15T12:00:00Z", "medium", "en-US");
        expect(result).toContain("Jan");
        expect(result).toContain("2025");
    });

    it("formats in compact style", () => {
        const result = formatDate("2025-06-20T12:00:00Z", "compact", "en-US");
        expect(result).toContain("Jun");
    });
});

describe("formatRelativeTime", () => {
    it("formats recent times", () => {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        const result = formatRelativeTime(fiveMinutesAgo, "en-US");
        expect(result).toContain("minute");
    });
});
