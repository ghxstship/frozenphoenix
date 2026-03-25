import { describe, expect, it } from "vitest";
import { formatParsedPreview, parseNaturalDate } from "@/lib/formatters/nlp-date-parser";

// ═══════════════════════════════════════════════════════════════
// NLP DATE PARSER (GAP-SCH-01)
// ═══════════════════════════════════════════════════════════════

// Use a fixed reference date for deterministic tests
const REF_DATE = new Date(2026, 2, 25, 10, 0, 0); // March 25, 2026, 10:00 AM (Wednesday)

describe("parseNaturalDate — relative dates", () => {
    it("parses 'tomorrow' correctly", () => {
        const result = parseNaturalDate("tomorrow", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getDate()).toBe(26);
        expect(result!.date.getMonth()).toBe(2); // March
        expect(result!.hasTime).toBe(false);
    });

    it("parses 'yesterday' correctly", () => {
        const result = parseNaturalDate("yesterday", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getDate()).toBe(24);
    });

    it("parses 'today' correctly", () => {
        const result = parseNaturalDate("today", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getDate()).toBe(25);
    });

    it("parses 'in 3 days' relative to reference", () => {
        const result = parseNaturalDate("in 3 days", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getDate()).toBe(28);
    });

    it("parses 'in 2 weeks' correctly", () => {
        const result = parseNaturalDate("in 2 weeks", REF_DATE);
        expect(result).not.toBeNull();
        const expected = new Date(REF_DATE);
        expected.setDate(expected.getDate() + 14);
        expect(result!.date.getDate()).toBe(expected.getDate());
    });

    it("parses 'next Tuesday' correctly", () => {
        // REF_DATE is Wednesday March 25. Next Tuesday = March 31
        const result = parseNaturalDate("next Tuesday", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getDay()).toBe(2); // Tuesday
        expect(result!.date.getDate()).toBe(31);
    });

    it("parses 'next Tuesday at 2pm' with time", () => {
        const result = parseNaturalDate("next Tuesday at 2pm", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.hasTime).toBe(true);
        expect(result!.date.getHours()).toBe(14);
        expect(result!.date.getMinutes()).toBe(0);
    });
});

describe("parseNaturalDate — absolute dates", () => {
    it("parses 'March 15, 2026' as absolute date", () => {
        const result = parseNaturalDate("March 15, 2026", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getFullYear()).toBe(2026);
        expect(result!.date.getMonth()).toBe(2); // March
        expect(result!.date.getDate()).toBe(15);
    });

    it("parses 'March 15' without year (defaults to current year)", () => {
        const result = parseNaturalDate("March 15", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getFullYear()).toBe(2026);
        expect(result!.date.getMonth()).toBe(2);
        expect(result!.date.getDate()).toBe(15);
    });

    it("parses abbreviated month 'Mar 15'", () => {
        const result = parseNaturalDate("Mar 15", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getMonth()).toBe(2);
        expect(result!.date.getDate()).toBe(15);
    });

    it("parses slash format '3/15/2026'", () => {
        const result = parseNaturalDate("3/15/2026", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getFullYear()).toBe(2026);
        expect(result!.date.getMonth()).toBe(2);
        expect(result!.date.getDate()).toBe(15);
    });
});

describe("parseNaturalDate — time parsing", () => {
    it("parses 'tomorrow at 2pm' with afternoon time", () => {
        const result = parseNaturalDate("tomorrow at 2pm", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.hasTime).toBe(true);
        expect(result!.date.getHours()).toBe(14);
    });

    it("parses 'tomorrow at 9am' with morning time", () => {
        const result = parseNaturalDate("tomorrow at 9am", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getHours()).toBe(9);
    });

    it("parses 'tomorrow at 2:30pm' with minutes", () => {
        const result = parseNaturalDate("tomorrow at 2:30pm", REF_DATE);
        expect(result).not.toBeNull();
        expect(result!.date.getHours()).toBe(14);
        expect(result!.date.getMinutes()).toBe(30);
    });
});

describe("parseNaturalDate — edge cases", () => {
    it("returns null for empty string", () => {
        expect(parseNaturalDate("")).toBeNull();
    });

    it("returns null for whitespace only", () => {
        expect(parseNaturalDate("   ")).toBeNull();
    });

    it("returns null for unparseable input", () => {
        expect(parseNaturalDate("gibberish text here")).toBeNull();
    });

    it("returns null for undefined-like inputs", () => {
        expect(parseNaturalDate("")).toBeNull();
    });
});

describe("formatParsedPreview", () => {
    it("returns human-readable date string without time", () => {
        const date = new Date(2026, 2, 31); // March 31, 2026 (Tuesday)
        const preview = formatParsedPreview(date, false);
        expect(preview).toMatch(/Tue/);
        expect(preview).toMatch(/Mar/);
        expect(preview).toMatch(/31/);
        expect(preview).toMatch(/2026/);
        expect(preview).not.toMatch(/at/);
    });

    it("returns human-readable date string with time", () => {
        const date = new Date(2026, 2, 31, 14, 0); // 2:00 PM
        const preview = formatParsedPreview(date, true);
        expect(preview).toMatch(/2:00 PM/);
    });

    it("formats midnight correctly", () => {
        const date = new Date(2026, 2, 31, 0, 0);
        const preview = formatParsedPreview(date, true);
        expect(preview).toMatch(/12:00 AM/);
    });
});
